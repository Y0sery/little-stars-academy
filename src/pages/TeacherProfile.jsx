import React from 'react';
import { useParams } from 'react-router-dom';
import { Award, BookOpen, Star, User } from 'lucide-react';

export default function TeacherProfile() {
  const { teacherId } = useParams();

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Info */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" 
              alt="صورة المعلم"
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
            />
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>الأستاذة سارة أحمد</h2>
              <span className="badge badge-secondary">معلم مادة الرياضيات والعلوم</span>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '8px' }}>
                خبرة أكثر من 8 سنوات في تدريس الرياضيات والمناهج الإبداعية للأطفال بطريقة تفاعلية وممتعة.
              </p>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--color-border)' }} />

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '8px' }}>
                <Star size={24} fill="var(--color-primary)" />
              </div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>4.9 / 5</h4>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>تقييمات الطلاب</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-secondary)', marginBottom: '8px' }}>
                <User size={24} />
              </div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>+120</h4>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>طالب نشط</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-pink)', marginBottom: '8px' }}>
                <Award size={24} />
              </div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>8+ سنوات</h4>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>خبرة تعليمية</span>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>نبذة عن المعلم</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
              أؤمن بأن كل طفل عبقري بطريقته الخاصة. لذا أستخدم ألعاب الذكاء والألغاز والقصص لتبسيط المفاهيم المعقدة في الرياضيات والعلوم الفيزيائية وجعلها قريبة من خيال الطفل.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
