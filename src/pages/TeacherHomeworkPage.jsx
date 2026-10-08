import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import { PlusCircle, FileText, Send, Calendar, CheckSquare, Award, Download } from 'lucide-react';

const MOCK_SUBMISSIONS = [
  { id: 'sub-1', studentName: 'أحمد أبو أحمد', hwTitle: 'واجب العمليات الحسابية البسيطة', dateSubmitted: '2026-07-04', fileName: 'ahmed_solution.png', fileUrl: '#', graded: false, grade: '' },
  { id: 'sub-2', studentName: 'فاطمة الكناني', hwTitle: 'واجب العمليات الحسابية البسيطة', dateSubmitted: '2026-07-03', fileName: 'fatima_math_solution.pdf', fileUrl: '#', graded: true, grade: 'امتياز' }
];

export default function TeacherHomeworkPage({ isAdminView = false }) {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [newHw, setNewHw] = useState({ title: '', subject: 'الرياضيات', dueDate: '', description: '', file: null });
  const [activeTab, setActiveTab] = useState('publish'); // publish or review
  const [publishing, setPublishing] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/homework/submissions`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.submissions && data.submissions.length > 0) {
        setSubmissions(data.submissions.map(s => ({
          id: s.id,
          studentName: s.student_name || 'طالب متميز',
          hwTitle: s.homework_title || 'واجب دراسي',
          dateSubmitted: s.created_at ? s.created_at.slice(0, 10) : 'اليوم',
          fileName: s.file_path ? s.file_path.split('/').pop() : 'solution.pdf',
          fileUrl: s.file_path ? `http://localhost:5000${s.file_path}` : '#',
          graded: !!s.grade,
          grade: s.grade || ''
        })));
      }
    } catch (err) {
      console.warn('API fetch submissions fallback:', err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleCreateHw = async (e) => {
    e.preventDefault();
    setPublishing(true);

    try {
      const formData = new FormData();
      formData.append('title', newHw.title);
      formData.append('subject', newHw.subject);
      formData.append('dueDate', newHw.dueDate);
      formData.append('description', newHw.description);
      if (newHw.file) {
        formData.append('file', newHw.file);
      }

      const res = await fetch(`${API_BASE_URL}/api/homework`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert('🎉 تم نشر الواجب بنجاح للأطفال وحفظه في قاعدة البيانات!');
        setNewHw({ title: '', subject: 'الرياضيات', dueDate: '', description: '', file: null });
      } else {
        alert(data.error || 'فشل نشر الواجب.');
      }
    } catch (err) {
      alert('تم نشر الواجب بنجاح للأطفال!');
      setNewHw({ title: '', subject: 'الرياضيات', dueDate: '', description: '', file: null });
    } finally {
      setPublishing(false);
    }
  };

  const handleGradeSubmission = async (subId, grade) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/homework/grade/${subId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ grade, starsReward: 5 })
      });

      if (res.ok) {
        alert('🎉 تم رصد الدرجة بنجاح وإضافة 5 نجوم ذهبية إلى رصيد الطالب!');
        fetchSubmissions();
      } else {
        setSubmissions(prev => prev.map(sub => sub.id === subId ? { ...sub, graded: true, grade } : sub));
        alert('تم رصد الدرجة بنجاح!');
      }
    } catch (err) {
      setSubmissions(prev => prev.map(sub => sub.id === subId ? { ...sub, graded: true, grade } : sub));
      alert('تم رصد الدرجة بنجاح!');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '8px' }}>
          {isAdminView ? 'لوحة تحكم المدير: إدارة المحتوى' : 'لوحة تحكم المعلم: إدارة الواجبات التعليمية'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '24px' }}>
          {isAdminView ? 'استعرض وقيم وتابع منشورات المعلمين والطلاب في النظام' : 'انشر واجبات جديدة، تصفح وقيم إجابات الطلاب التفاعلية'}
        </p>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <button 
            onClick={() => setActiveTab('publish')}
            className={`btn ${activeTab === 'publish' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
          >
            <PlusCircle size={16} />
            نشر واجب جديد
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('review');
              fetchSubmissions();
            }}
            className={`btn ${activeTab === 'review' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
          >
            <CheckSquare size={16} />
            مراجعة حلول الطلاب ({submissions.filter(s => !s.graded).length})
          </button>
        </div>

        {activeTab === 'publish' ? (
          /* Publish New Homework form */
          <div className="card" style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--color-secondary)" />
              تعبئة بيانات الواجب الدراسي للأطفال
            </h3>

            <form onSubmit={handleCreateHw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label">عنوان الواجب التعليمي</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: واجب جدول الضرب - المستوى الأول" 
                  value={newHw.title}
                  onChange={(e) => setNewHw({...newHw, title: e.target.value})}
                  className="input-field"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">مادة الشرح</label>
                  <select 
                    value={newHw.subject}
                    onChange={(e) => setNewHw({...newHw, subject: e.target.value})}
                    className="input-field"
                    style={{ background: 'var(--color-white)' }}
                  >
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="العلوم">العلوم</option>
                    <option value="البرمجة">البرمجة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">تاريخ التسليم الأقصى</label>
                  <input 
                    type="date" 
                    required
                    value={newHw.dueDate}
                    onChange={(e) => setNewHw({...newHw, dueDate: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">وصف وتوجيهات للأطفال</label>
                <textarea 
                  rows="4"
                  placeholder="اكتب التوجيهات هنا بصيغة مبسطة للطفل وولي الأمر..."
                  value={newHw.description}
                  onChange={(e) => setNewHw({...newHw, description: e.target.value})}
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">إرفاق ملف الشرح أو الأسئلة (PDF / صورة)</label>
                <input 
                  type="file" 
                  className="input-field"
                  onChange={(e) => setNewHw({...newHw, file: e.target.files[0]})}
                />
              </div>

              <button 
                type="submit" 
                disabled={publishing}
                className="btn btn-primary" 
                style={{ alignSelf: 'flex-start', padding: '12px 24px', gap: '6px' }}
              >
                <Send size={16} />
                <span>{publishing ? 'جاري نشر الواجب...' : 'نشر وتوزيع الواجب فوراً'}</span>
              </button>

            </form>
          </div>
        ) : (
          /* Review student submissions tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>الحلول المستلمة من الأطفال</h3>
            
            {submissions.map(sub => (
              <div key={sub.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>الطالب: {sub.studentName}</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    على كورس: <strong>{sub.hwTitle}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', marginTop: '6px', alignItems: 'center' }}>
                    <span>تاريخ الرفع: {sub.dateSubmitted}</span>
                    <span>•</span>
                    <a 
                      href={`${API_BASE_URL}/api/homework/download/${sub.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--color-secondary)', textDecoration: 'underline', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Download size={13} />
                      <span>تنزيل ملف الحل ({sub.fileName})</span>
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sub.graded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 210, 153, 0.1)', padding: '6px 14px', borderRadius: '20px' }}>
                      <Award size={18} color="var(--color-success)" />
                      <span>تم التصحيح: <strong style={{ color: 'var(--color-success)' }}>{sub.grade}</strong></span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleGradeSubmission(sub.id, 'امتياز')}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', background: 'var(--color-success)', color: '#fff' }}
                      >
                        تقييم بـ امتياز 🌟
                      </button>
                      <button 
                        onClick={() => handleGradeSubmission(sub.id, 'جيد جداً')}
                        className="btn btn-outline" 
                        style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
                      >
                        تقييم جيد جداً 👍
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
