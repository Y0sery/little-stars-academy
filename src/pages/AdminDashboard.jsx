import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { API_BASE_URL } from '../config/api';
import { PlusCircle, FileText, Send, Calendar, CheckSquare, Award, Trash2, Edit, Save, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses'); // courses, homework, stats
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add course form state
  const [newCourse, setNewCourse] = useState({
    title: '',
    subject: 'الرياضيات',
    ageGroup: '6-8 سنوات',
    price: '',
    teacherName: '',
    imageUrl: ''
  });

  // Edit price state
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await response.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses in admin panel:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.price || !newCourse.teacherName) {
      alert('يرجى تعبئة الحقول المطلوبة.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse)
      });
      const data = await response.json();
      if (response.ok) {
        alert('تم إضافة الكورس بنجاح!');
        setNewCourse({ title: '', subject: 'الرياضيات', ageGroup: '6-8 سنوات', price: '', teacherName: '', imageUrl: '' });
        fetchCourses();
      } else {
        alert(data.error || 'فشل إضافة الكورس.');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالخادم.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الكورس نهائياً؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('تم حذف الكورس بنجاح.');
        fetchCourses();
      } else {
        const data = await response.json();
        alert(data.error || 'فشل حذف الكورس.');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالخادم.');
    }
  };

  const handleSavePrice = async (id) => {
    if (!editedPrice) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: editedPrice })
      });
      if (response.ok) {
        alert('تم تحديث السعر بنجاح!');
        setEditingCourseId(null);
        setEditedPrice('');
        fetchCourses();
      } else {
        const data = await response.json();
        alert(data.error || 'فشل تحديث السعر.');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالخادم.');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '8px' }}>لوحة تحكم المدير (الأدمن) 🛡️</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: '24px' }}>
          لديك الصلاحية الكاملة لإضافة وحذف الكورسات، تعديل الأسعار، ومراقبة التقدم الدراسي.
        </p>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`btn ${activeTab === 'courses' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
          >
            <BookOpen size={16} />
            إدارة الكورسات والأسعار
          </button>
          
          <button 
            onClick={() => setActiveTab('publish')}
            className={`btn ${activeTab === 'publish' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
          >
            <PlusCircle size={16} />
            إضافة كورس جديد
          </button>

          <button 
            onClick={() => setActiveTab('stats')}
            className={`btn ${activeTab === 'stats' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
          >
            <Award size={16} />
            الإحصائيات العامة
          </button>
        </div>

        {activeTab === 'courses' && (
          /* List courses tab with price editor and delete buttons */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>الكورسات المفعلة في النظام</h3>
            {loading ? (
              <div>جاري التحميل...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg-white)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-light)', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>
                      <th style={{ padding: '16px' }}>اسم الكورس</th>
                      <th style={{ padding: '16px' }}>المادة</th>
                      <th style={{ padding: '16px' }}>الفئة العمرية</th>
                      <th style={{ padding: '16px' }}>المدرس</th>
                      <th style={{ padding: '16px' }}>السعر</th>
                      <th style={{ padding: '16px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{course.title}</td>
                        <td style={{ padding: '16px' }}>
                          <span className="badge badge-secondary">{course.subject}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className="badge badge-gold">{course.age_group || course.ageGroup}</span>
                        </td>
                        <td style={{ padding: '16px' }}>{course.teacher_name || course.teacherName || course.teacher}</td>
                        <td style={{ padding: '16px' }}>
                          {editingCourseId === course.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text"
                                value={editedPrice}
                                onChange={(e) => setEditedPrice(e.target.value)}
                                className="input-field"
                                style={{ width: '100px', padding: '6px' }}
                                placeholder="السعر"
                              />
                              <button onClick={() => handleSavePrice(course.id)} className="btn btn-secondary btn-icon" style={{ width: '30px', height: '30px' }}>
                                <Save size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontWeight: 800, color: 'var(--color-secondary)' }}>{course.price}</span>
                              <button 
                                onClick={() => {
                                  setEditingCourseId(course.id);
                                  setEditedPrice(course.price.replace(' ج.م', ''));
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="btn btn-outline" 
                            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', padding: '6px 12px', gap: '4px', fontSize: 'var(--text-xs)' }}
                          >
                            <Trash2 size={12} />
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'publish' && (
          /* Add course form */
          <div className="card" style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} color="var(--color-secondary)" />
              إدخال تفاصيل الكورس الجديد
            </h3>
            
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">عنوان الكورس التعليمي</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: أساسيات الفيزياء الكونية للأطفال"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="input-field"
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">المادة</label>
                  <select 
                    value={newCourse.subject}
                    onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                    className="input-field"
                    style={{ background: 'var(--color-white)' }}
                  >
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="العلوم">العلوم</option>
                    <option value="البرمجة">البرمجة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">الفئة العمرية</label>
                  <select 
                    value={newCourse.ageGroup}
                    onChange={(e) => setNewCourse({...newCourse, ageGroup: e.target.value})}
                    className="input-field"
                    style={{ background: 'var(--color-white)' }}
                  >
                    <option value="4-6 سنوات">4-6 سنوات</option>
                    <option value="6-8 سنوات">6-8 سنوات</option>
                    <option value="8-11 سنة">8-11 سنة</option>
                    <option value="9-12 سنة">9-12 سنة</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">السعر بالجنيه المصري (ج.م)</label>
                  <input 
                    type="number"
                    required
                    placeholder="مثال: 300"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">اسم المعلم المسؤول</label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: الأستاذ خالد كمال"
                    value={newCourse.teacherName}
                    onChange={(e) => setNewCourse({...newCourse, teacherName: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">رابط صورة الكورس (اختياري)</label>
                <input 
                  type="text"
                  placeholder="ضع رابط الصورة هنا..."
                  value={newCourse.imageUrl}
                  onChange={(e) => setNewCourse({...newCourse, imageUrl: e.target.value})}
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px', gap: '6px' }}>
                <Send size={16} />
                نشر وإضافة الكورس فوراً
              </button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          /* General statistics overview */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <BookOpen size={32} color="var(--color-secondary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{courses.length}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>الكورسات المفعلة</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <CheckSquare size={32} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 800 }}>+45</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>الواجبات المسلمة من الطلاب</p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <Award size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 800 }}>+450</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>النجوم الذهبية الموزعة للأبطال</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
