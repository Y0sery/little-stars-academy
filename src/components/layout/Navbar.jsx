import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GraduationCap, LogOut, LayoutDashboard, Sparkles, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--color-bg-white)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Logo and Brand Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-dark)' }}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            padding: '6px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Sparkles size={22} color="var(--color-dark-bg)" />
          </div>
          <span style={{ fontFamily: 'Cairo', fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '-0.5px' }}>
            أكاديمية النجوم الصغار
          </span>
        </Link>

        {/* Navigation Links - Desktop Only */}
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="desktop-only-flex">
          <Link 
            to="/" 
            style={{ 
              fontWeight: 700, 
              color: isActive('/') ? 'var(--color-secondary)' : 'var(--color-text-muted)',
              borderBottom: isActive('/') ? '2px solid var(--color-secondary)' : '2px solid transparent',
              padding: '20px 0'
            }}
          >
            الرئيسية
          </Link>
          <Link 
            to="/courses" 
            style={{ 
              fontWeight: 700, 
              color: isActive('/courses') ? 'var(--color-secondary)' : 'var(--color-text-muted)',
              borderBottom: isActive('/courses') ? '2px solid var(--color-secondary)' : '2px solid transparent',
              padding: '20px 0'
            }}
          >
            الكورسات التعليمية
          </Link>
          {isAuthenticated && (
            <Link 
              to="/dashboard" 
              style={{ 
                fontWeight: 700, 
                color: location.pathname.startsWith('/dashboard') ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                borderBottom: location.pathname.startsWith('/dashboard') ? '2px solid var(--color-secondary)' : '2px solid transparent',
                padding: '20px 0'
              }}
            >
              لوحة التحكم
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-dark)' }} className="desktop-only">
                {user?.name}
              </span>
              <Link to="/dashboard">
                <img 
                  src={user?.avatarUrl} 
                  alt={user?.name}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-secondary)',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                />
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: 'var(--text-sm)', gap: '4px' }}
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
                <span className="desktop-only">خروج</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                تسجيل الدخول
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .desktop-only-flex { display: none !important; }
        }
      `}</style>
    </header>
  );
}
