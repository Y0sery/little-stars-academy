import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sparkles, User, Phone, Hash, Mail, Lock } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = Registration form, 2 = OTP Verification
  const [formData, setFormData] = useState({
    parentName: '',
    whatsapp: '',
    studentCode: '',
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(59);
  const { switchRole } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Go to OTP step
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    // Successfully verified, set state to parent/student and go to dashboard
    switchRole('parent');
    navigate('/dashboard');
  };

  const handleResendOtp = () => {
    setCountdown(59);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '32px' }}>
        
        {step === 1 ? (
          /* Step 1: Register Form */
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', background: 'var(--color-primary)', padding: '10px', borderRadius: '50%', marginBottom: '12px' }}>
                <Sparkles size={24} color="var(--color-dark-bg)" />
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>إنشاء حساب جديد</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>سجل طفلك وابدأ معه رحلة التفوق</p>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label">الاسم الكامل لولي الأمر</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    required
                    placeholder="مثال: محمود يسرى " 
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="input-field"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <User size={18} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">رقم الواتساب</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="tel" 
                    required
                    placeholder="مثال: +966 50 123 4567" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="input-field"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <Phone size={18} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  الرقم التسلسلي / كود الطالب 
                  <span style={{ fontSize: '10px', color: 'var(--color-text-light)', marginRight: '4px' }}>(اختياري)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="مثال: STD-8492" 
                    value={formData.studentCode}
                    onChange={(e) => setFormData({...formData, studentCode: e.target.value})}
                    className="input-field"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <Hash size={18} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    required
                    placeholder="example@stars.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <Lock size={18} style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                إنشاء الحساب وتفعيل الكود
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              لديك حساب بالفعل؟ <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>سجل الدخول من هنا</Link>
            </div>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(138, 92, 246, 0.1)', color: 'var(--color-secondary)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                <Phone size={24} />
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>تأكيد رقم الهاتف</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>أرسلنا كود تفعيل مكون من 4 أرقام لهاتفك {formData.whatsapp}</p>
            </div>

            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ alignItems: 'center' }}>
                <input 
                  type="text" 
                  maxLength="4" 
                  required
                  placeholder="• • • •" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  style={{
                    width: '160px',
                    fontSize: '28px',
                    letterSpacing: '12px',
                    textAlign: 'center',
                    padding: '8px'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                تأكيد ومتابعة الدخول
              </button>

              <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                {countdown > 0 ? (
                  <span style={{ color: 'var(--color-text-muted)' }}>يمكنك طلب إعادة الإرسال بعد {countdown} ثانية</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    إعادة إرسال كود التفعيل
                  </button>
                )}
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
