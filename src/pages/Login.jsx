import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import { Sparkles, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { switchRole, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      console.warn('API login offline, using mock role switch:', err);
    } finally {
      setLoading(false);
    }

    // Fallback simulation for offline testing
    if (email.includes('teacher')) {
      switchRole('teacher');
    } else if (email.includes('admin')) {
      switchRole('admin');
    } else {
      switchRole('parent');
    }
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--color-primary)', padding: '10px', borderRadius: '50%', marginBottom: '12px' }}>
            <Sparkles size={24} color="var(--color-dark-bg)" />
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>تسجيل الدخول للأكاديمية</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>أهلاً بك مجدداً في بوابة النجوم الصغار</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني أو الهاتف</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                required
                placeholder="example@stars.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <Mail size={18} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <Lock size={18} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            تسجيل الدخول
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          ليس لديك حساب؟ <Link to="/register" style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>إنشاء حساب جديد</Link>
        </div>

        {/* Helper guide */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(138, 92, 246, 0.05)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: '1.4'
        }}>
          💡 <strong>نصيحة للتجربة السريعة:</strong> اكتب بريداً يحتوي على الكلمة <code>teacher</code> للدخول بحساب المعلم، أو <code>admin</code> لحساب الأدمن، أو أي بريد آخر للدخول كولي أمر. كما يمكنك التغيير في أي وقت عبر القائمة العائمة أسفل اليسار.
        </div>

      </div>
    </div>
  );
}
