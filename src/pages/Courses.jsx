import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Star, Calendar, Film, Video } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('الكل');

  const subjects = ['الكل', 'الرياضيات', 'العلوم', 'البرمجة'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses`);
        const data = await response.json();
        if (data.courses) {
          setCourses(data.courses);
        } else {
          throw new Error('No courses list');
        }
      } catch (err) {
        console.warn('Failed to load courses from API, fallback to EGP seeds:', err.message);
        // Fallback to locally seeded courses in Egyptian Pounds (EGP)
        setCourses([
          {
            id: 'math-1',
            title: 'رياضيات الفضاء الاستكشافية للأطفال',
            subject: 'الرياضيات',
            age_group: '6-8 سنوات',
            lessons_count: 12,
            rating: 4.9,
            price: '250 ج.م',
            image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80',
            teacher_name: 'الأستاذة سارة'
          },
          {
            id: 'science-1',
            title: 'مختبر العلوم الصغير: تجارب تفاعلية',
            subject: 'العلوم',
            age_group: '8-11 سنة',
            lessons_count: 16,
            rating: 4.8,
            price: '300 ج.م',
            image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
            teacher_name: 'الأستاذ خالد'
          },
          {
            id: 'code-1',
            title: 'برمجة الألعاب باستخدام سكراتش (Scratch)',
            subject: 'البرمجة',
            age_group: '9-12 سنة',
            lessons_count: 20,
            rating: 5.0,
            price: '350 ج.م',
            image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
            teacher_name: 'المهندس أحمد'
          },
          {
            id: 'math-2',
            title: 'العمليات الحسابية الذهنية السريعة',
            subject: 'الرياضيات',
            age_group: '7-9 سنوات',
            lessons_count: 10,
            rating: 4.7,
            price: '200 ج.م',
            image_url: 'https://images.unsplash.com/photo-1453733190148-c44698c26578?auto=format&fit=crop&w=400&q=80',
            teacher_name: 'الأستاذة سارة'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const title = course.title || '';
    const teacher = course.teacher_name || course.teacherName || course.teacher || '';
    const subject = course.subject || '';
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'الكل' || subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, padding: '40px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>استكشف كورساتنا التعليمية</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>اختر الكورس الأنسب لعمر واهتمام طفلك وابدأ التعلم الآن</p>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '32px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input 
              type="text" 
              placeholder="ابحث عن اسم الكورس أو المعلم..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <Search size={18} style={{
              position: 'absolute',
              top: '50%',
              right: '14px',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-light)'
            }} />
          </div>

          {/* Subject Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {subjects.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`btn ${selectedSubject === subject ? 'btn-secondary' : 'btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>
            جاري تحميل الكورسات...
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid-cols-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <div key={course.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img 
                    src={course.image_url || course.imageUrl} 
                    alt={course.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-secondary">{course.subject}</span>
                      <span className="badge badge-gold">{course.age_group || course.ageGroup}</span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-dark)', minHeight: '48px' }}>
                      {course.title}
                    </h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                      <span>المدرس: {course.teacher_name || course.teacherName || course.teacher}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" />
                        <span style={{ fontWeight: 'bold', color: 'var(--color-text-dark)' }}>{course.rating || 5.0}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>سعر الكورس</div>
                          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-secondary)' }}>{course.price}</span>
                        </div>
                        <Link 
                          to={`/session/live-class-${course.id}`} 
                          className="btn btn-primary" 
                          style={{ padding: '8px 14px', fontSize: 'var(--text-xs)', gap: '6px' }}
                        >
                          <Video size={14} />
                          <span>البث المباشر</span>
                        </Link>
                      </div>

                      <Link 
                        to={`/courses/${course.id}/recordings`} 
                        className="btn btn-outline" 
                        style={{ width: '100%', padding: '8px 12px', fontSize: 'var(--text-xs)', gap: '6px', justifyContent: 'center' }}
                      >
                        <Film size={14} color="var(--color-secondary)" />
                        <span>المحاضرات المسجلة والأرشيف</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                لم يتم العثور على أي كورسات تطابق شروط البحث.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
