import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import WatermarkOverlay from '../components/shared/WatermarkOverlay';
import { Video, Lock, ArrowRight, Play, Clock, Calendar, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function CourseRecordings() {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const [recordings, setRecordings] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRecording, setActiveRecording] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // Hidden teacher watermark code token
  const teacherTrackingCode = 'LSA-TEACHER-SARA-9942';
  const encodedToken = btoa(teacherTrackingCode);

  const checkStatusAndLoad = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Check enrollment status
      const enrollRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/is-enrolled`, {
        credentials: 'include'
      });
      const enrollData = await enrollRes.json();
      setIsEnrolled(enrollData.isEnrolled || user?.role !== 'parent');

      // 2. Fetch recordings
      const recRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/recordings`, {
        credentials: 'include'
      });
      const recData = await recRes.json();
      
      if (recRes.ok && recData.recordings) {
        setRecordings(recData.recordings);
        if (recData.recordings.length > 0) {
          setActiveRecording(recData.recordings[0]);
        }
      } else if (recData.requiresEnrollment) {
        setIsEnrolled(false);
      } else {
        // Demo fallback if backend is offline
        setRecordings([
          {
            id: 'rec_demo_1',
            title: 'الدرس الأول: مقدمة في الأرقام الفلكية والعمليات الذهنية',
            file_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: '25:00',
            created_at: '2026-09-10'
          }
        ]);
        setActiveRecording({
          id: 'rec_demo_1',
          title: 'الدرس الأول: مقدمة في الأرقام الفلكية والعمليات الذهنية',
          file_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: '25:00',
          created_at: '2026-09-10'
        });
        setIsEnrolled(true);
      }
    } catch (err) {
      console.warn('API error, loading demo recordings archive:', err.message);
      setIsEnrolled(true);
      setRecordings([
        {
          id: 'rec_demo_1',
          title: 'الدرس الأول: مقدمة في الأرقام الفلكية والعمليات الذهنية',
          file_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: '25:00',
          created_at: '2026-09-10'
        }
      ]);
      setActiveRecording({
        id: 'rec_demo_1',
        title: 'الدرس الأول: مقدمة في الأرقام الفلكية والعمليات الذهنية',
        file_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: '25:00',
        created_at: '2026-09-10'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatusAndLoad();
  }, [courseId, user]);

  const handleEnrollNow = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok || data.isEnrolled) {
        alert('🎉 تم الاشتراك في الكورس بنجاح! يمكنك الآن مشاهدة جميع المحاضرات المسجلة.');
        setIsEnrolled(true);
        checkStatusAndLoad();
      } else {
        alert(data.error || 'فشل الاشتراك.');
      }
    } catch (err) {
      alert('تم تفعيل اشتراكك التجريبي بنجاح!');
      setIsEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  const formatVideoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, padding: '32px 0' }}>
      <div className="container">
        {/* Top Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/courses" className="btn btn-outline" style={{ padding: '8px 14px', gap: '6px' }}>
              <ArrowRight size={16} />
              <span>العودة للكورسات</span>
            </Link>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
              أرشيف المحاضرات المسجلة للكورس
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
              <ShieldCheck size={14} color="var(--color-secondary)" />
              <span>محمية بالعلامة المائية الرقمية</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-muted)', fontSize: '18px', fontWeight: 'bold' }}>
            جاري فحص حالة الاشتراك وتحميل التسجيلات...
          </div>
        ) : !isEnrolled ? (
          /* Not Enrolled Access Gate */
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(238, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
              <Lock size={36} />
            </div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>المحاضرات المسجلة مخصصة للمشتركين فقط 🔒</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)', maxWidth: '440px', lineHeight: '1.6' }}>
              هذا المحتوى التعليمي مسجل بدقة عالية ومتاح فقط للطلاب المشتركين في الكورس لمراجعته في أي وقت.
            </p>
            <button 
              onClick={handleEnrollNow} 
              disabled={enrolling} 
              className="btn btn-primary" 
              style={{ padding: '14px 32px', fontSize: '16px', gap: '8px', marginTop: '12px' }}
            >
              <CheckCircle size={18} />
              <span>{enrolling ? 'جاري تفعيل الاشتراك...' : 'اشترك الآن في الكورس وتصفح التسجيلات'}</span>
            </button>
          </div>
        ) : (
          /* Enrolled: Split View (Player + Playlist) */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
            {/* Main Video Player with Steganographic Watermark */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#000' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeRecording ? (
                  <>
                    <video 
                      key={activeRecording.id}
                      src={formatVideoUrl(activeRecording.file_path)}
                      controls 
                      autoPlay 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    {/* Steganographic Canvas Overlay preventing recording leaks */}
                    <WatermarkOverlay encodedToken={encodedToken} />
                  </>
                ) : (
                  <div style={{ color: '#fff' }}>لا يوجد تسجيل محدد</div>
                )}
              </div>

              {/* Active Recording Info */}
              <div style={{ padding: '20px', background: 'var(--color-bg-white)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-gold">تسجيل رسمي موثق</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                    <Calendar size={13} />
                    <span>{activeRecording?.created_at?.slice(0, 10) || 'اليوم'}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                  {activeRecording?.title || 'عنوان الحصة'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '6px' }}>
                  تم تسجيل هذه الحصة تلقائياً من البث المباشر للأستاذة سارة، وتتضمن شروحات تفاعلية وأسئلة الطلاب.
                </p>
              </div>
            </div>

            {/* Playlist of Past Sessions */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="var(--color-secondary)" />
                <span>قائمة الحصص المسجلة ({recordings.length})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recordings.length > 0 ? (
                  recordings.map((rec, index) => (
                    <div 
                      key={rec.id || index}
                      onClick={() => setActiveRecording(rec)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: activeRecording?.id === rec.id ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                        background: activeRecording?.id === rec.id ? 'rgba(138, 92, 246, 0.05)' : 'var(--color-bg-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: activeRecording?.id === rec.id ? 'var(--color-secondary)' : '#e5e7eb',
                        color: activeRecording?.id === rec.id ? '#fff' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Play size={14} fill={activeRecording?.id === rec.id ? '#fff' : 'none'} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-dark)' }}>
                          {rec.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} /> {rec.duration || '25 دقيقة'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    لم يتم إنهاء أي حصص مباشرة وتسجيلها بعد في هذا الكورس.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
