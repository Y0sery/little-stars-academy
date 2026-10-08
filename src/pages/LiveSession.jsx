import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import ChatPanel from '../components/shared/ChatPanel';
import WatermarkOverlay from '../components/shared/WatermarkOverlay';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL, SOCKET_URL, ICE_SERVERS } from '../config/api';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Play, 
  Square, 
  Star, 
  Users, 
  Award, 
  HelpCircle, 
  XCircle, 
  Radio, 
  UploadCloud, 
  Film,
  Sparkles
} from 'lucide-react';

export default function LiveSession() {
  const { sessionId = 'live-class-math' } = useParams();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  // Live Stream & Device States
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [studentStreamAvailable, setStudentStreamAvailable] = useState(false);
  const [isRecordingUploading, setIsRecordingUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // Interactive Quiz & Gamification
  const [showQuiz, setShowQuiz] = useState(true);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [starCount, setStarCount] = useState(12);

  // References
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({}); // For teacher: studentSocketId -> RTCPeerConnection
  const studentPeerRef = useRef(null); // For student
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Secret watermark tracking code
  const teacherTrackingCode = 'LSA-TEACHER-SARA-9942';
  const encodedToken = btoa(teacherTrackingCode);

  // 1. Socket.io & WebRTC Signaling Setup
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { user },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Live session socket connected:', socket.id);
      socket.emit('joinRoom', { sessionId });
    });

    // Student: Teacher announced live stream started
    socket.on('stream-started', ({ teacherSocketId }) => {
      console.log('Stream started by teacher:', teacherSocketId);
      setStudentStreamAvailable(true);
    });

    // Student: Received WebRTC Offer from Teacher
    socket.on('webrtc-offer', async ({ offer, teacherSocketId }) => {
      console.log('Student received WebRTC offer from teacher');
      try {
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS
        });
        studentPeerRef.current = pc;

        pc.ontrack = (event) => {
          console.log('Student received remote stream track');
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setStudentStreamAvailable(true);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc-candidate', {
              targetSocketId: teacherSocketId,
              candidate: event.candidate,
              sessionId
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          teacherSocketId,
          answer
        });
      } catch (err) {
        console.error('Error handling WebRTC offer on student:', err);
      }
    });

    // Teacher: Received WebRTC Answer from Student
    socket.on('webrtc-answer', async ({ studentSocketId, answer }) => {
      console.log('Teacher received WebRTC answer from student:', studentSocketId);
      const pc = peerConnectionsRef.current[studentSocketId];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description on teacher:', err);
        }
      }
    });

    // ICE Candidate Exchange
    socket.on('webrtc-candidate', async ({ fromSocketId, candidate }) => {
      try {
        if (isTeacherOrAdmin) {
          const pc = peerConnectionsRef.current[fromSocketId];
          if (pc && candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } else {
          if (studentPeerRef.current && candidate) {
            await studentPeerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    // Teacher: When a student joins the room, send them an offer if teacher is currently streaming
    socket.on('user-joined', async ({ socketId }) => {
      if (isTeacherOrAdmin && localStreamRef.current && isStreaming) {
        console.log('New student joined, initiating WebRTC offer to:', socketId);
        initiateTeacherPeerConnection(socketId, localStreamRef.current);
      }
    });

    // Stream finished by teacher
    socket.on('stream-ended', () => {
      setStudentStreamAvailable(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      socket.disconnect();
    };
  }, [sessionId, user, isTeacherOrAdmin, isStreaming]);

  // Helper for teacher to establish peer connection with student
  const initiateTeacherPeerConnection = async (studentSocketId, stream) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: ICE_SERVERS
      });
      peerConnectionsRef.current[studentSocketId] = pc;

      // Add local stream tracks to send to student
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('webrtc-candidate', {
            targetSocketId: studentSocketId,
            candidate: event.candidate,
            sessionId
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit('webrtc-offer', {
        targetSocketId: studentSocketId,
        offer,
        sessionId
      });
    } catch (err) {
      console.error('Failed to create peer connection for student:', studentSocketId, err);
    }
  };

  // 2. Start Live Stream (Teacher Studio)
  const handleStartStream = async () => {
    try {
      // Access camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsStreaming(true);
      setCameraActive(true);
      setMicActive(true);

      // Start Automatic Recording via MediaRecorder API
      try {
        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };
        let recorder;
        if (MediaRecorder.isTypeSupported(options.mimeType)) {
          recorder = new MediaRecorder(stream, options);
        } else {
          recorder = new MediaRecorder(stream);
        }

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.start(1000); // chunk every 1 second
        mediaRecorderRef.current = recorder;
        console.log('MediaRecorder started automatically for session recording.');
      } catch (recErr) {
        console.warn('MediaRecorder not supported or failed to start:', recErr);
      }

      // Notify room via socket
      if (socketRef.current) {
        socketRef.current.emit('stream-started', { sessionId });
      }

      alert('🔴 تم بدء البث الحي بنجاح! بدأ التسجيل التلقائي للمحاضرة في الخلفية.');
    } catch (err) {
      console.error('Failed to start camera stream:', err);
      alert('تعذر فتح الكاميرا أو المايكروفون. يرجى التأكد من إعطاء الصلاحيات للمتصفح.');
    }
  };

  // 3. Toggle Screen Sharing
  const handleToggleScreenShare = async () => {
    if (!isStreaming) {
      alert('يرجى بدء البث الحي أولاً.');
      return;
    }

    if (!isSharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track for all connected peers
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          // Revert to camera if user stops sharing via browser UI
          handleRevertToCamera();
        };

        setIsSharingScreen(true);
      } catch (err) {
        console.error('Screen sharing error:', err);
      }
    } else {
      handleRevertToCamera();
    }
  };

  const handleRevertToCamera = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const camTrack = camStream.getVideoTracks()[0];

      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(camTrack);
      });

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsSharingScreen(false);
    } catch (err) {
      console.error('Revert camera error:', err);
    }
  };

  // 4. Toggle Camera
  const handleToggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  // 5. Toggle Mic
  const handleToggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  // 6. End Stream & Auto-Upload Recording
  const handleEndStream = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إنهاء البث الحي وحفظ التسجيل للطلاب؟')) return;

    // Stop MediaRecorder and trigger upload
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsRecordingUploading(true);
      setUploadMessage('جاري معالجة ورفع الفيديو المسجل إلى مكتبة الكورس...');

      mediaRecorderRef.current.onstop = async () => {
        const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        console.log('Recording finished, blob size:', recordedBlob.size);

        // Upload recorded video to backend
        try {
          const formData = new FormData();
          formData.append('videoFile', recordedBlob, `session_${Date.now()}.webm`);
          formData.append('title', `حصة مسجلة مباشرة: الأستاذة سارة (${new Date().toLocaleDateString('ar-EG')})`);
          formData.append('duration', '15 دقيقة');

          const courseId = 'math-1';
          const uploadRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/recordings`, {
            method: 'POST',
            credentials: 'include',
            body: formData
          });

          const data = await uploadRes.json();
          if (uploadRes.ok) {
            alert('🎉 تم إنهاء البث وحفظ المحاضرة المسجلة بنجاح في أرشيف الكورس!');
          } else {
            console.warn('Upload error:', data.error);
            alert('تم إنهاء البث بنجاح.');
          }
        } catch (uploadErr) {
          console.error('Failed to upload recording:', uploadErr);
          alert('تم إنهاء البث.');
        } finally {
          setIsRecordingUploading(false);
          setUploadMessage('');
        }
      };

      mediaRecorderRef.current.stop();
    }

    // Stop camera & mic tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setIsStreaming(false);

    // Notify all peers that stream ended
    if (socketRef.current) {
      socketRef.current.emit('stream-ended', { sessionId });
    }
  };

  // Quiz Answer Handler
  const handleQuizAnswer = (answer) => {
    setQuizAnswered(true);
    if (answer === 20) {
      setQuizSuccess(true);
      setStarCount(prev => prev + 5);
      alert('🎉 إجابة صحيحة! لقد ربحت 5 نجوم ذهبية إضافية!');
    } else {
      setQuizSuccess(false);
      alert('❌ إجابة خاطئة، حاول مرة أخرى في السؤال القادم!');
    }
  };

  return (
    <div className="live-session-layout">
      {/* Video Stream + Controls Pane */}
      <div className="video-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* Main Video Viewport */}
        <div style={{ position: 'relative', flex: 1, width: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          {isTeacherOrAdmin ? (
            /* TEACHER STUDIO VIEW */
            isStreaming ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#fff', padding: '40px 20px', maxWidth: '440px' }}>
                <Radio size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>استوديو البث الحي للمعلم</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                  أهلاً بك يا أستاذة! اضغطي على زر بدء البث لفتح الكاميرا والمايك وبث الحصة التفاعلية لجميع الطلاب المتواجدين الآن.
                </p>
                <button 
                  onClick={handleStartStream}
                  className="btn btn-primary pulse-glow"
                  style={{ padding: '14px 32px', fontSize: '16px', gap: '8px' }}
                >
                  <Play size={18} />
                  <span>بدء البث المباشر الآن</span>
                </button>
              </div>
            )
          ) : (
            /* STUDENT VIEWER VIEW */
            studentStreamAvailable ? (
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              /* Fallback / Waiting Screen for Student */
              <div style={{ textAlign: 'center', color: '#fff', padding: '40px 20px', maxWidth: '450px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(138, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }} className="pulse-glow">
                  <Radio size={32} color="var(--color-secondary)" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>بانتظار بدء المعلم للبث... ⏳</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  المعلمة سارة أحمد تجهز أدوات الشرح الآن. سيبدأ البث الحي تلقائياً فور انطلاق الحصة!
                </p>
                {/* Sample Educational clip preview */}
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                  📺 يمكنك كتابة الأسئلة في الشات المباشر أثناء الانتظار
                </div>
              </div>
            )
          )}

          {/* Steganographic Leak Tracking Watermark Canvas (Running on both Live & Recordings) */}
          <WatermarkOverlay encodedToken={encodedToken} />

          {/* Top Live Status Bar */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 15
          }}>
            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isStreaming || studentStreamAvailable ? 'rgba(238, 68, 68, 0.9)' : 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                <span style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                <span>{isStreaming || studentStreamAvailable ? 'مباشر الآن 🔴' : 'غير متصل'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: 'var(--text-xs)' }}>
                <Users size={12} color="var(--color-primary)" />
                <span>42 طالب متصل</span>
              </div>
              {isStreaming && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(138, 92, 246, 0.85)', padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: 'var(--text-xs)' }}>
                  <Film size={12} />
                  <span>التسجيل التلقائي نشط</span>
                </div>
              )}
            </div>

            {/* Student Gamification Points Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--gradient-primary)', padding: '6px 14px', borderRadius: '20px', color: 'var(--color-dark-bg)', fontWeight: 'bold', fontSize: 'var(--text-sm)', pointerEvents: 'auto', boxShadow: 'var(--shadow-md)' }}>
              <Star size={16} fill="var(--color-dark-bg)" />
              <span>{starCount} نجمة ذهبية</span>
            </div>
          </div>

          {/* Interactive Child Quiz Popup */}
          {showQuiz && !quizAnswered && (
            <div className="quiz-overlay pulse-glow" style={{ pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary)' }}>
                  <HelpCircle size={18} />
                  <strong style={{ fontSize: 'var(--text-sm)' }}>سؤال تفاعلي سريع!</strong>
                </div>
                <button 
                  onClick={() => setShowQuiz(false)} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer' }}
                >
                  <XCircle size={16} />
                </button>
              </div>
              
              <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>ما هو ناتج العملية الحسابية: ٤ × ٥ ؟</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => handleQuizAnswer(9)} className="btn btn-outline" style={{ padding: '6px', fontSize: 'var(--text-xs)' }}>٩</button>
                <button onClick={() => handleQuizAnswer(20)} className="btn btn-outline" style={{ padding: '6px', fontSize: 'var(--text-xs)' }}>٢٠ (عشرون)</button>
                <button onClick={() => handleQuizAnswer(15)} className="btn btn-outline" style={{ padding: '6px', fontSize: 'var(--text-xs)' }}>١٥</button>
              </div>
            </div>
          )}

          {/* Quiz Success Celebration */}
          {quizAnswered && quizSuccess && showQuiz && (
            <div className="quiz-overlay" style={{ textAlign: 'center', padding: '20px', pointerEvents: 'auto' }}>
              <Award size={36} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>أحسنت يا بطل!</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>أنت عبقري الرياضيات الصغير!</p>
              <button onClick={() => setShowQuiz(false)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '10px', marginTop: '10px' }}>متابعة الدرس</button>
            </div>
          )}

          {/* Recording Uploading Toast Banner */}
          {isRecordingUploading && (
            <div style={{
              position: 'absolute',
              bottom: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 30
            }} className="pulse-glow">
              <UploadCloud size={20} color="var(--color-primary)" />
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>

        {/* TEACHER LIVE CONTROL TOOLBAR */}
        {isTeacherOrAdmin && (
          <div style={{
            background: 'var(--color-dark-bg)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={handleToggleCamera} 
                disabled={!isStreaming}
                className={`btn btn-icon ${cameraActive ? 'btn-outline' : 'btn-secondary'}`}
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: '38px', height: '38px' }}
                title={cameraActive ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              >
                {cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button 
                onClick={handleToggleMic} 
                disabled={!isStreaming}
                className={`btn btn-icon ${micActive ? 'btn-outline' : 'btn-secondary'}`}
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: '38px', height: '38px' }}
                title={micActive ? 'كتم الصوت' : 'تشغيل الصوت'}
              >
                {micActive ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button 
                onClick={handleToggleScreenShare} 
                disabled={!isStreaming}
                className={`btn btn-icon ${isSharingScreen ? 'btn-primary' : 'btn-outline'}`}
                style={{ color: isSharingScreen ? '#000' : '#fff', borderColor: 'rgba(255,255,255,0.3)', width: '38px', height: '38px' }}
                title="مشاركة الشاشة"
              >
                <Monitor size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link 
                to="/courses/math-1/recordings" 
                className="btn btn-outline" 
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 14px', fontSize: '13px', gap: '6px' }}
              >
                <Film size={15} />
                <span>أرشيف التسجيلات</span>
              </Link>

              {isStreaming ? (
                <button 
                  onClick={handleEndStream}
                  className="btn btn-outline"
                  style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)', color: '#fff', padding: '8px 18px', gap: '6px', fontSize: '13px' }}
                >
                  <Square size={14} fill="#fff" />
                  <span>إنهاء البث وحفظ التسجيل</span>
                </button>
              ) : (
                <button 
                  onClick={handleStartStream}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', gap: '6px', fontSize: '13px' }}
                >
                  <Play size={14} fill="var(--color-dark-bg)" />
                  <span>بدء البث الحي</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Interactive Chat Area (Real-Time Socket.io) */}
      <ChatPanel sessionId={sessionId} />
    </div>
  );
}
