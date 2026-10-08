import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Trophy, BookOpen, Clock, PlayCircle, Star, Award, CheckCircle } from 'lucide-react';

export default function ParentDashboard() {
  const { user } = useAuthStore();

  const mockBadges = [
    { name: 'بطل الضرب القوي', icon: '🧠', color: '#f4c542', desc: 'لحل 10 مسائل ضرب سريعة' },
    { name: 'مستكشف النجوم', icon: '🚀', color: '#8a5cf6', desc: 'لحضور أول درس لايف فلكي' },
    { name: 'الملتزم المبدع', icon: '📝', color: '#f471b6', desc: 'لرفع جميع حلول الواجبات في موعدها' }
  ];

  const activeCourses = [
    { id: 'math-1', title: 'رياضيات الفضاء الاستكشافية', progress: 65, nextClass: 'اليوم الساعة 04:00 م', status: 'live' },
    { id: 'code-1', title: 'برمجة الألعاب باستخدام Scratch', progress: 30, nextClass: 'غداً الساعة 05:30 م', status: 'upcoming' }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar for Desktop navigation */}
      <Sidebar />

      {/* Main dashboard content */}
      <main className="dashboard-main">
        
        {/* Welcome Section */}
        <div className="card" style={{
          background: 'var(--gradient-accent)',
          color: 'var(--color-white)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ color: 'var(--color-white)', fontWeight: 800, fontSize: 'var(--text-xl)' }}>
              مرحباً، {user?.name} 👋
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
              تابع نشاط طفلك المميز <strong style={{ color: 'var(--color-primary)' }}>{user?.childName}</strong> وشاهد تقدمه الدراسي اليومي!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Star size={18} fill="var(--color-primary)" />
                <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-white)' }}>{user?.points}</span>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>نجوم طفلك</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Trophy size={18} />
                <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-white)' }}>المستوى الذهبي</span>
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>تصنيف الطالب</span>
            </div>
          </div>
        </div>

        {/* Live Broadcast Blinking Alert */}
        <div className="card pulse-glow" style={{
          border: '2px solid var(--color-success)',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(52, 210, 153, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--color-success)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite'
            }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>الآن: البث المباشر لمادة الرياضيات الاستكشافية متاح!</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>المعلمة سارة أحمد تشرح حالياً الفصل الثالث للأطفال.</p>
            </div>
          </div>
          <Link to="/session/live-class-math" className="btn btn-secondary" style={{ background: 'var(--color-success)', gap: '6px' }}>
            <PlayCircle size={18} />
            انضم للبث الحي الآن
          </Link>
        </div>

        {/* Two-Column Detail Grid */}
        <div className="grid-cols-2">
          
          {/* Active Courses Progress */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--color-secondary)" />
                كورسات طفلي الجارية
              </h3>
              <Link to="/courses" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 'bold' }}>تصفح المزيد</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeCourses.map(course => (
                <div key={course.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{course.title}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 'bold' }}>{course.progress}% completed</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--gradient-accent)', borderRadius: '4px' }} />
                  </div>
                  
                  {/* Footer schedule */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>المحاضرة القادمة: {course.nextClass}</span>
                    </div>
                    {course.status === 'live' && (
                      <span className="badge badge-success">مباشر الآن</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Child Badges / Gamified Rewards */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--color-primary)" />
              الأوسمة والجوائز التي حققها طفلي
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockBadges.map((badge, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '24px', width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-bg-white)', display: 'flex', alignItems: 'center', justify: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    {badge.icon}
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-dark)' }}>{badge.name}</h5>
                    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{badge.desc}</p>
                  </div>
                  <CheckCircle size={16} color="var(--color-success)" style={{ marginRight: 'auto' }} />
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Embedded CSS rules */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
