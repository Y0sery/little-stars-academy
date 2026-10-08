import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Unauthorized({ allowedRoles = [] }) {
  const { user } = useAuthStore();

  const getRoleName = (role) => {
    switch (role) {
      case 'parent': return 'ولي أمر / طالب';
      case 'teacher': return 'معلم';
      case 'admin': return 'مدير النظام (أدمن)';
      default: return 'زائر';
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        
        {/* Animated Security Lock Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(238, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger)'
        }} className="pulse-glow">
          <ShieldAlert size={44} />
        </div>

        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-dark)' }}>
            عذراً، ليس لديك صلاحيات الوصول! 🛡️
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '8px', lineHeight: '1.6' }}>
            لقد حاولت الدخول إلى قسم محمي مخصص لـ 
            <strong style={{ color: 'var(--color-secondary)', margin: '0 4px' }}>
              {allowedRoles.map(r => getRoleName(r)).join(' أو ')}
            </strong> 
            فقط.
          </p>
        </div>

        {/* Current user status indicator */}
        <div style={{
          width: '100%',
          padding: '12px',
          background: 'var(--color-bg-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)'
        }}>
          <span>حسابك الحالي مسجل كـ: </span>
          <strong style={{ color: 'var(--color-danger)' }}>{getRoleName(user?.role)}</strong>
        </div>

        <div style={{ width: '100%', marginTop: '10px' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
            <ArrowLeft size={16} />
            العودة للوحة التحكم الآمنة
          </Link>
        </div>

      </div>
    </div>
  );
}
