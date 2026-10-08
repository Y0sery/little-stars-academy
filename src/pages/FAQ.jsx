import React from 'react';

export default function FAQ() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>الأسئلة الشائعة</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>كيف تعمل الحصص المباشرة؟</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              يدخل المعلم إلى البث في الوقت المحدد للجدول، ويظهر إشعار للطفل للانضمام. يتم تشغيل البث المباشر ومعه شات تفاعلي آمن لطرح الأسئلة وحل الألغاز.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>هل يتم تسجيل الحصص؟</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              نعم، بعد انتهاء البث المباشر بدقائق، يتم تحويل الدرس تلقائياً إلى تسجيل فيديو، ويستطيع الطفل مشاهدته من لوحة التحكم في أي وقت لاحق لمراجعة الشروحات.
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>كيف يتم رفع الواجبات وحلها؟</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              يرفع المدرس الواجب، ويستطيع ولي الأمر تحميله ثم إعادة تصوير حل الطفل ورفعه كصورة أو ملف PDF عبر لوحة التحكم ليتم تقييمها من المعلم.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
