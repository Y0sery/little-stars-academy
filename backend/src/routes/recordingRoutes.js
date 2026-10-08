import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbGet, dbRun, dbAll } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure the local uploads/recordings directory exists
const recordingsDir = path.resolve(__dirname, '../../uploads/recordings');
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

// Multer Storage Configuration for Recording Videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'rec-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.webm', '.mp4', '.mkv', '.mov'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext) && !file.mimetype.includes('video')) {
    return cb(new Error('صيغة الفيديو غير مدعومة. الصيغ المسموحة: WebM, MP4.'), false);
  }
  cb(null, true);
};

const uploadRecording = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024 // 150 MB limit for stream session clips
  }
});

// 1. Enroll logged-in student in a course
router.post('/courses/:courseId/enroll', authenticateToken, async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await dbGet('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ error: 'الكورس غير موجود.' });
    }

    const existing = await dbGet('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [req.user.id, courseId]);
    if (existing) {
      return res.json({ message: 'أنت مشترك في هذا الكورس بالفعل!', isEnrolled: true });
    }

    const enrollId = 'enr_' + Date.now();
    await dbRun('INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)', [
      enrollId,
      req.user.id,
      courseId
    ]);

    return res.status(201).json({ message: 'تم الاشتراك في الكورس بنجاح!', isEnrolled: true });
  } catch (err) {
    console.error('Enrollment error:', err.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الاشتراك.' });
  }
});

// 2. Check if user is enrolled
router.get('/courses/:courseId/is-enrolled', authenticateToken, async (req, res) => {
  const { courseId } = req.params;

  // Teachers and admins always have access
  if (['teacher', 'admin'].includes(req.user.role)) {
    return res.json({ isEnrolled: true, role: req.user.role });
  }

  try {
    const enrolled = await dbGet('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [req.user.id, courseId]);
    return res.json({ isEnrolled: !!enrolled });
  } catch (err) {
    return res.status(500).json({ error: 'فشل التحقق من حالة الاشتراك.' });
  }
});

// 3. Upload Stream Recording (Teacher / Admin)
router.post('/courses/:courseId/recordings', authenticateToken, requireRole(['teacher', 'admin']), uploadRecording.single('videoFile'), async (req, res) => {
  const { courseId } = req.params;
  const { title, duration } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'يرجى إرفاق ملف الفيديو المسجل.' });
  }

  try {
    const recId = 'rec_' + Date.now();
    const filePath = `/api/recordings/file/${req.file.filename}`;

    await dbRun(`
      INSERT INTO recordings (id, course_id, title, file_path, duration)
      VALUES (?, ?, ?, ?, ?)
    `, [
      recId,
      courseId,
      title || `تسجيل حصة مباشرة - ${new Date().toLocaleDateString('ar-EG')}`,
      filePath,
      duration || 'غير محدد'
    ]);

    return res.status(201).json({
      message: 'تم حفظ تسجيل الحصة بنجاح وإتاحته للطلاب المشتركين!',
      recording: { id: recId, title, filePath, duration }
    });
  } catch (err) {
    console.error('Recording upload error:', err.message);
    return res.status(500).json({ error: 'حدث خطأ أثناء حفظ تسجيل الفيديو.' });
  }
});

// 4. Fetch Course Recorded Lectures (Enrolled students or Teacher/Admin)
router.get('/courses/:courseId/recordings', authenticateToken, async (req, res) => {
  const { courseId } = req.params;

  try {
    // Verify access if user is student/parent
    if (req.user.role === 'parent') {
      const isEnrolled = await dbGet('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [req.user.id, courseId]);
      if (!isEnrolled) {
        return res.status(403).json({
          error: 'عذراً، يجب عليك الاشتراك في هذا الكورس أولاً لمشاهدة المحاضرات المسجلة.',
          requiresEnrollment: true
        });
      }
    }

    const recordings = await dbAll('SELECT * FROM recordings WHERE course_id = ? ORDER BY created_at DESC', [courseId]);
    return res.json({ recordings });
  } catch (err) {
    console.error('Fetch recordings error:', err.message);
    return res.status(500).json({ error: 'فشل استرجاع تسجيلات الكورس.' });
  }
});

// 5. Safe Streaming Video with Range Request Support (HTTP 206 Partial Content)
router.get('/recordings/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(recordingsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'ملف التسجيل غير موجود.' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parse Range header e.g. "bytes=32324-"
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/webm',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/webm',
      'Accept-Ranges': 'bytes'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;
