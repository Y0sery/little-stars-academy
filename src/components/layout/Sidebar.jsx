import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Settings, 
  CreditCard, 
  Users, 
  Award 
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--color-bg-white)',
      borderLeft: '1px solid var(--color-border)',
      height: 'calc(100vh - 64px)',
      position: 'fixed',
      top: '64px',
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      boxShadow: 'var(--shadow-sm)',
      zIndex: 50
    }} className="desktop-only-aside">
      {/* User Quick Profile Info */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '20px'
      }}>
        <img 
          src={user?.avatarUrl} 
          alt={user?.name}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid var(--color-primary)',
            objectFit: 'cover'
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-dark)' }}>{user?.name}</h4>
          <span className="badge badge-secondary" style={{ marginTop: '4px' }}>
            {user?.role === 'parent' ? 'ولي أمر / طالب' : user?.role === 'teacher' ? 'مدرس المادة' : 'مدير النظام'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>لوحة التحكم الرئيسية</span>
        </NavLink>

        {user?.role === 'parent' && (
          <>
            <NavLink 
              to="/dashboard/homework" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>واجبات طفلي</span>
            </NavLink>

            <div className="sidebar-link-disabled" title="سيتم تفعيلها لاحقاً">
              <Award size={20} />
              <span>أوسمة طفلي</span>
            </div>

            <div className="sidebar-link-disabled" title="سيتم تفعيلها لاحقاً">
              <CreditCard size={20} />
              <span>المدفوعات والفواتير</span>
            </div>
          </>
        )}

        {user?.role === 'teacher' && (
          <>
            <NavLink 
              to="/dashboard/teacher-homework" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>إدارة الواجبات والحلول</span>
            </NavLink>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={20} />
              <span>إدارة الكورسات والأسعار</span>
            </NavLink>
          </>
        )}

        {/* Live Classroom Link */}
        <NavLink 
          to="/session/live-class-math" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Video size={20} />
          <span>شاشة البث المباشر</span>
        </NavLink>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <div className="sidebar-link-disabled">
            <Settings size={20} />
            <span>الإعدادات الشخصية</span>
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-only-aside {
            display: none !important;
          }
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          font-weight: 700;
          transition: var(--transition-fast);
        }

        .sidebar-link:hover {
          background-color: var(--color-bg-light);
          color: var(--color-text-dark);
        }

        .sidebar-link.active {
          background-color: rgba(138, 92, 246, 0.08);
          color: var(--color-secondary);
        }

        .sidebar-link-disabled {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--color-text-light);
          font-weight: 700;
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </aside>
  );
}
