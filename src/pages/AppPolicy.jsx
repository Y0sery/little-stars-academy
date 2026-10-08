import React from 'react';

export default function AppPolicy() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-light)', flex: 1, padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>سياسة الخصوصية وأمان الأطفال</h1>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>حماية البيانات الشخصية للأطفال</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            أمان طفلك هو أولويتنا القصوى. نحن لا نطلب أو نخزن معلومات شخصية حساسة عن الأطفال، ويتم التواصل فقط عبر حساب ولي الأمر المسجل برقم الواتساب والبريد الإلكتروني المعتمد.
          </p>

          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>حظر التعديل والحذف في المحادثات</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            بناءً على معايير الأمان المتبعة في منصتنا، لا نسمح بأي عمليات تعديل (Edit) أو حذف (Delete) للرسائل في المحادثات العامة أو المباشرة. يهدف هذا الإجراء لحفظ وتوثيق سلوكيات التواصل ومنع أي إساءة استخدام أو تنمر بين الطلاب.
          </p>

          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>العلامات المائية الرقمية (Watermarks)</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            نقوم بترميز ودمج علامة مائية رقمية مخفية غير مرئية للعين المجردة في مشغلات الفيديو والدروس التعليمية. تحتوي هذه العلامة على كود تعريفي مشفر يخص الحساب الذي يقوم بالتشغيل. في حال تم تسريب أو تسجيل أي جزء من الشرح خارج منصتنا، سنتمكن بسهولة من تتبع الكود ومعرفة الحساب المسؤول عن التسريب لحماية حقوق الملكية الفكرية للمعلمين.
          </p>

        </div>
      </div>
    </div>
  );
}
