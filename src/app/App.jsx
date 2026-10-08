import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './router';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, UserCheck, ShieldAlert, Sliders, X } from 'lucide-react';
import '../App.css';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// A floating widget for the user to switch roles on the fly (SaaS demo mode)
const RoleSwitcherWidget = () => {
  const { user, switchRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-icon pulse-glow"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          border: '2px solid var(--color-white)'
        }}
        title="تغيير دور المستخدم (تجريبي)"
      >
        {isOpen ? <X size={22} /> : <Sliders size={22} />}
      </button>

      {/* Popover Switcher Dialog */}
      {isOpen && (
        <div 
          className="role-switcher-debug" 
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '20px',
            zIndex: 99998,
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          <div className="role-switcher-title">تغيير دور المستخدم (تجريبي)</div>
          
          <button
            onClick={() => {
              switchRole('parent');
              setIsOpen(false);
            }}
            className={`role-switcher-btn ${user?.role === 'parent' ? 'active' : ''}`}
            title="حساب ولي الأمر والطالب"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <UserCheck size={14} />
              <span>طالب / ولي أمر</span>
            </div>
          </button>

          <button
            onClick={() => {
              switchRole('teacher');
              setIsOpen(false);
            }}
            className={`role-switcher-btn ${user?.role === 'teacher' ? 'active' : ''}`}
            title="حساب المدرس"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <GraduationCap size={14} />
              <span>مدرس (لايف وواجبات)</span>
            </div>
          </button>

          <button
            onClick={() => {
              switchRole('admin');
              setIsOpen(false);
            }}
            className={`role-switcher-btn ${user?.role === 'admin' ? 'active' : ''}`}
            title="حساب الأدمن"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <ShieldAlert size={14} />
              <span>مدير المنصة (أدمن)</span>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-layout">
          {/* Top Main Navbar */}
          <Navbar />

          {/* Main App Content View */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AppRouter />
          </div>

          {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
          <BottomNav />

          {/* Debug role switcher for easy demonstration */}
          <RoleSwitcherWidget />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
