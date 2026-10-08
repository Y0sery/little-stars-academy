import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, BookOpen, LayoutDashboard, FileText, Video } from 'lucide-react';

export default function BottomNav() {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Only show bottom navigation on mobile screens
  return (
    <div className="mobile-only-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'var(--color-bg-white)',
      borderTop: '1px solid var(--color-border)',
      display: 'none', // Managed by responsive CSS below
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 999,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      <NavLink 
        to="/" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>الرئيسية</span>
      </NavLink>

      <NavLink 
        to="/courses" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <BookOpen size={20} />
        <span>الكورسات</span>
      </NavLink>

      {isAuthenticated && (
        <>
          <NavLink 
            to="/dashboard" 
            className={() => `bottom-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>لوحة التحكم</span>
          </NavLink>

          {user?.role === 'parent' ? (
            <NavLink 
              to="/dashboard/homework" 
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>الواجبات</span>
            </NavLink>
          ) : (
            <NavLink 
              to="/dashboard/teacher-homework" 
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>إدارة الواجب</span>
            </NavLink>
          )}

          {/* Shortcut to simulated live session */}
          <NavLink 
            to="/session/live-class-math" 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Video size={20} />
            <span>البث المباشر</span>
          </NavLink>
        </>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .mobile-only-nav {
            display: flex !important;
          }
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          color: var(--color-text-light);
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          flex: 1;
          height: 100%;
          transition: var(--transition-fast);
        }

        .bottom-nav-item.active {
          color: var(--color-secondary);
        }

        .bottom-nav-item:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
