import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Video, FileText, MessageSquare, Award, Play } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-bg-white) 0%, var(--color-bg-light) 100%)', padding: '60px 0' }}>
        <div className="container hero-section">
          <div className="hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 197, 66, 0.15)', padding: '6px 12px', borderRadius: '20px', width: 'fit-content' }}>
              <Sparkles size={16} color="#c48c08" />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#c48c08' }}>مستقبل أطفالنا يبدأ هنا!</span>
            </div>
            
            <h1 className="hero-title">
              منصة تعليمية تفاعلية بلمسة <span>ذكية وممتعة</span> للأطفال
            </h1>
            
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', maxWidth: '540px' }}>
              شروحات تفاعلية مباشرة مع نخبة من المدرسين المعتمدين، شات آمن، ومتابعة فورية للواجبات والمهام في بيئة برمجية متكاملة مصممة خصيصاً لولي الأمر والطفل.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 'var(--text-base)' }}>
                ابدأ رحلتك مجاناً الآن
              </Link>
              <Link to="/courses" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: 'var(--text-base)', gap: '8px' }}>
                <Play size={18} />
                تصفح الكورسات
              </Link>
            </div>
          </div>
          
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80" 
              alt="شروحات مباشرة للأطفال"
            />
            {/* Visual floating badge */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '-10px',
              background: 'var(--color-bg-white)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }} className="pulse-glow">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(52, 210, 153, 0.15)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Award color="var(--color-success)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>حصة تجريبية مجانية</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>لمدة 30 دقيقة مباشرة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container" style={{ marginTop: '60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '40px' }}>
          لماذا يفضل الآباء والمعلمون أكاديمية النجوم؟
        </h2>

        <div className="grid-cols-3">
          {/* Card 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(138, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justify: 'center' }}>
              <Video size={30} color="var(--color-secondary)" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>بث مباشر وتسجيل تلقائي</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              حصص تفاعلية مباشرة بالصوت والفيديو مع المدرسين، مع إمكانية مشاهدة الدروس المسجلة في أي وقت لاحقاً بضغطة زر.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(244, 197, 66, 0.15)', display: 'flex', alignItems: 'center', justify: 'center' }}>
              <FileText size={30} color="#c48c08" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>بوابة ذكية للواجبات</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              يستطيع المدرس إرسال ملفات الواجب للطفل، كما يمكن للطفل أو ولي الأمر رفع الحلول ومتابعة التقييمات بكل سهولة.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(244, 113, 182, 0.1)', display: 'flex', alignItems: 'center', justify: 'center' }}>
              <MessageSquare size={30} color="var(--color-pink)" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>محادثات تفاعلية آمنة</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              شات حي ومحادثات آمنة غير قابلة للتعديل أو الحذف لتوثيق تفاعل الطلاب وحمايتهم من أي سلوكيات غير مرغوبة.
            </p>
          </div>
        </div>
      </section>

      {/* Embedded Leak Prevention Callout */}
      <section className="container" style={{ marginTop: '80px' }}>
        <div style={{
          background: 'var(--color-bg-slate)',
          color: 'var(--color-white)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '30px'
        }}>
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'inline-flex', width: 'fit-content', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: '12px', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
              حماية الملكية الفكرية
            </div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>حماية الدروس ضد التسريب والسرقة</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-light)' }}>
              منصتنا توفر نظاماً أمنياً متقدماً يقوم بترميز وعرض علامة مائية مخفية steganographic watermark أثناء تشغيل الفيديو باسم وكود المدرس الفريد لتتبع أي محاولات تسريب خارج المنصة دون إثارة انتباه الطالب.
            </p>
          </div>
          <div>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              جرب المنصة الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
