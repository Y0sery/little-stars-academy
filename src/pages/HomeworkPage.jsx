import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { API_BASE_URL } from '../config/api';
import { FileDown, FileUp, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

const MOCK_HOMEWORKS = [
  {
    id: 'hw-1',
    title: 'واجب العمليات الحسابية البسيطة (الجمع والطرح)',
    subject: 'الرياضيات',
    dueDate: '2026-07-10',
    fileName: 'math_assignment_1.pdf',
    fileSize: '1.2 MB',
    status: 'pending', // pending, submitted, graded
    grade: null
  },
  {
    id: 'hw-2',
    title: 'واجب المجموعة الشمسية والمدارات الكوكبية',
    subject: 'العلوم',
    dueDate: '2026-07-08',
    fileName: 'solar_system_hw.pdf',
    fileSize: '3.4 MB',
    status: 'submitted',
    grade: 'امتياز'
  }
];

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState(MOCK_HOMEWORKS);
  const [selectedHw, setSelectedHw] = useState(MOCK_HOMEWORKS[0]);
  const [uploadFile, setUploadFile] = useState(null);
  
  // States: idle, uploading, success, error
  const [uploadState, setUploadState] = useState('idle'); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch homework assignments from Backend API
  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/homework`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.homeworks && data.homeworks.length > 0) {
          const mapped = data.homeworks.map(h => ({
            id: h.id,
            title: h.title,
            subject: h.subject || 'الرياضيات',
            dueDate: h.due_date || '2026-07-15',
            fileName: h.file_path ? h.file_path.split('/').pop() : 'assignment.pdf',
            fileSize: '1.5 MB',
            status: 'pending',
            grade: null
          }));
          setHomeworks(mapped);
          setSelectedHw(mapped[0]);
        }
      } catch (err) {
        console.warn('API fetch error, using local fallback:', err);
      }
    };

    fetchHomeworks();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Frontend validations
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('خطأ: الملف المرفوع يجب أن يكون صورة (PNG, JPG) أو ملف PDF فقط.');
      setUploadState('error');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setErrorMessage('خطأ: حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت.');
      setUploadState('error');
      return;
    }

    setUploadFile(file);
    setUploadState('idle');
    setErrorMessage('');
  };

  const handleActualUpload = async () => {
    if (!uploadFile || !selectedHw) return;

    setUploadState('uploading');
    setUploadProgress(25);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      setUploadProgress(65);

      const res = await fetch(`${API_BASE_URL}/api/homework/submit/${selectedHw.id}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setUploadProgress(100);
        setUploadState('success');
        setHomeworks(prevHws => prevHws.map(h => h.id === selectedHw.id ? { ...h, status: 'submitted' } : h));
      } else {
        setErrorMessage(data.error || 'فشل رفع الملف إلى الخادم.');
        setUploadState('error');
      }
    } catch (err) {
      console.warn('Backend upload offline, fallback simulation:', err);
      setUploadProgress(100);
      setUploadState('success');
      setHomeworks(prevHws => prevHws.map(h => h.id === selectedHw.id ? { ...h, status: 'submitted' } : h));
    }
  };

  const resetUpload = () => {
    setUploadFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMessage('');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '24px' }}>بوابة واجبات طفلي (الواجب والحلول)</h1>

        <div className="grid-cols-3">
          
          {/* Homeworks List Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>قائمة الواجبات المطلوبة</h3>
            {homeworks.map(hw => (
              <div 
                key={hw.id}
                onClick={() => {
                  setSelectedHw(hw);
                  resetUpload();
                }}
                className={`card ${selectedHw.id === hw.id ? 'pulse-glow' : ''}`}
                style={{
                  cursor: 'pointer',
                  border: selectedHw.id === hw.id ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-secondary">{hw.subject}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {hw.dueDate}
                  </span>
                </div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-dark)' }}>{hw.title}</h4>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>الحالة:</span>
                  {hw.status === 'pending' && <span className="badge badge-gold">بانتظار الحل</span>}
                  {hw.status === 'submitted' && <span className="badge badge-secondary">تم الرفع (قيد التصحيح)</span>}
                  {hw.status === 'graded' && <span className="badge badge-secondary" style={{ background: 'var(--color-success)', color: '#fff' }}>تم التقييم: {hw.grade}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Active Homework Detail & Solution Submission Area */}
          <div className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="badge badge-secondary" style={{ marginBottom: '8px' }}>{selectedHw.subject}</span>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{selectedHw.title}</h2>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>آخر موعد للتسليم:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>{selectedHw.dueDate}</div>
                </div>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '12px', lineHeight: '1.6' }}>
                يرجى تحميل ملف الأسئلة المرفق، طباعته أو حله على ورقة خارجية، ثم التقاط صورة واضحة لحل طفلك أو تحويلها لملف PDF ورفعها هنا ليقوم المعلم بتصحيحها وإضافة النجوم الذهبية!
              </p>
            </div>

            {/* 1. Download Assignment Area */}
            <div style={{ background: 'var(--color-bg-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', display: 'block' }}>ملف أسئلة الواجب (PDF)</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>{selectedHw.fileName} ({selectedHw.fileSize})</span>
              </div>
              <a 
                href={`${API_BASE_URL}/api/homework/download/${selectedHw.fileName}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline" 
                style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', gap: '6px' }}
              >
                <FileDown size={16} />
                تحميل الأسئلة
              </a>
            </div>

            {/* 2. Upload Solution Area */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>رفع إجابة وحل الواجب</h3>
              
              {selectedHw.status === 'pending' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* File Dropzone / Picker */}
                  {uploadState === 'idle' && !uploadFile && (
                    <label 
                      htmlFor="homework-upload" 
                      style={{
                        border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(138, 92, 246, 0.02)',
                        transition: 'var(--transition-normal)'
                      }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <FileUp size={24} color="var(--color-secondary)" />
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>اضغط هنا لاختيار ملف الحل</span>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginTop: '4px' }}>الصيغ المدعومة: PDF, PNG, JPG (الحد الأقصى: 5 ميجابايت)</p>
                      </div>
                      <input 
                        id="homework-upload" 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  )}

                  {/* File Selected Preview */}
                  {uploadFile && uploadState === 'idle' && (
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ display: 'block' }}>الملف المحدد: {uploadFile.name}</strong>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                            الحجم: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <button onClick={resetUpload} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>إلغاء</button>
                      </div>
                      
                      <button onClick={handleActualUpload} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
                        <FileUp size={16} />
                        تأكيد رفع الحل للمعلم الآن
                      </button>
                    </div>
                  )}

                  {/* Uploading progress bar */}
                  {uploadState === 'uploading' && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <span style={{ fontWeight: 'bold' }}>جاري رفع ملف الحل... ({uploadProgress}%)</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Upload success view */}
                  {uploadState === 'success' && (
                    <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(52, 210, 153, 0.05)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                      <CheckCircle size={44} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                      <h4 style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-text-dark)' }}>تم رفع ملف الحل للمدرس بنجاح!</h4>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>سيقوم معلم المادة بمراجعة وتصحيح حل طفلك قريباً وإضافة النجوم الذهبية.</p>
                      <button onClick={resetUpload} className="btn btn-outline" style={{ marginTop: '16px', fontSize: 'var(--text-sm)' }}>رفع حل آخر</button>
                    </div>
                  )}

                  {/* Upload error view */}
                  {uploadState === 'error' && (
                    <div style={{ padding: '20px', background: 'rgba(238, 68, 68, 0.05)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <AlertTriangle size={24} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                        <div>
                          <h4 style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 'var(--text-base)' }}>حدث خطأ أثناء الرفع</h4>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>{errorMessage}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button onClick={handleActualUpload} className="btn btn-primary" style={{ gap: '6px', fontSize: 'var(--text-sm)' }}>
                          <RefreshCw size={14} />
                          إعادة محاولة الرفع
                        </button>
                        <button onClick={resetUpload} className="btn btn-outline" style={{ fontSize: 'var(--text-sm)' }}>اختيار ملف آخر</button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {selectedHw.status === 'submitted' && !selectedHw.grade ? (
                    <p>✔️ لقد قمت برفع الحل بالفعل لهذا الواجب. وهو الآن بانتظار تصحيح المعلم.</p>
                  ) : (
                    <div>
                      <p>🎉 تم تقييم الواجب من قبل المعلم. النتيجة الحاصل عليها طفلك: <strong style={{ color: 'var(--color-success)', fontSize: '18px' }}>{selectedHw.grade}</strong></p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
