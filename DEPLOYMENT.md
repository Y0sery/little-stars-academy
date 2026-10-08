# 🚀 دليل النشر والتشغيل على سيرفر الإنتاج (Production Deployment Guide)
## أكاديمية النجوم الصغار (Little Stars Academy)

---

### 🌟 الخيار الأول: النشر السريع عبر Docker (الأسهل والموصى به)
إذا كان خادمك يحتوي على Docker و Docker Compose:

1. انسخ المشروع إلى السيرفر.
2. عدّل ملف `.env` و `.env` في الباك إند بروابط دومينك الحقيقي.
3. شغّل الأمر التالي:
```bash
docker compose up -d --build
```
سيعمل النظام فوراً:
- الواجهة الأمامية عبر **Nginx** على المنفذ `80` (أو `443` مع SSL).
- خادم الباك اند والسوكت على المنفذ `5000`.
- مجلد الفيديوهات وقاعدة بيانات SQLite محفوظة في مجلد دائم (Persistent Volume) لا يُمسح عند إعادة التشغيل.

---

### 🖥️ الخيار الثاني: النشر على سيرفر VPS مباشر (Ubuntu / Debian مع PM2 و Nginx)

#### 1. تثبيت المتطلبات على السيرفر:
```bash
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

#### 2. تشغيل الباك إند عبر PM2:
```bash
cd backend
npm ci --only=production
pm2 start ../ecosystem.config.cjs
pm2 save
pm2 startup
```

#### 3. بناء الواجهة الأمامية:
```bash
# داخل المجلد الرئيسي
npm ci
npm run build
```
ستجد الملفات الجاهزة داخل مجلد `dist/`.

#### 4. تفعيل شهادة الأمان المجانية (HTTPS / SSL):
لتشغيل الكاميرا والمايكروفون ومشاركة الشاشة على متصفحات كروم وسفاري، فعّل شهادة SSL بضغطة واحدة:
```bash
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

---

### 🌐 إعدادات الـ WebRTC على شبكات الموبايل (TURN Server):
إذا كنت تريد ضمان وصول البث لجميع شبكات 4G/5G التي تمنع الـ P2P المباشر:
1. سجّل مجاناً في موقع [Metered.ca](https://www.metered.ca/) أو [Xirsys](https://xirsys.com/).
2. أضف بيانات الخادم في ملف `.env` بالفرونت إند:
```env
VITE_TURN_SERVER=turn:global.turn.metered.ca:443
VITE_TURN_USERNAME=your_username
VITE_TURN_CREDENTIAL=your_password
```
وسيقوم النظام تلقائياً بدمج الخادم في مكالمات البث المباشر.

---

### 🔑 بيانات الحسابات الافتراضية للتجربة (Default Mock Credentials):
- **حساب ولي الأمر**: `parent@stars.com` / كلمة المرور: `password123`
- **حساب المعلم**: `teacher@stars.com` / كلمة المرور: `password123`
- **حساب المدير (أدمن)**: `admin@stars.com` / كلمة المرور: `password123`
