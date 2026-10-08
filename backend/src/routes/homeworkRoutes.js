import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbGet, dbRun, dbAll } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure the local uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Append unique hash to prevent naming collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer File Type/Size Filter Configuration (Security verification)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('الملف المرفق غير صالح. يرجى رفع ملفات PDF أو صور فقط (PNG, JPG).'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB Limit
  }
});

// Helper for sending file download
router.get('/download/:filename', authenticateToken, (req, res) => {
  const file = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: 'الملف المطلوب غير موجود.' });
  }
  // Prevent directory traversal
  const resolvedPath = path.resolve(file);
  if (!resolvedPath.startsWith(uploadDir)) {
    return res.status(403).json({ error: 'وصول غير مصرح به للملف.' });
  }
  return res.download(file);
});

// 1. Teacher/Admin: Publish New Homework
router.post('/', authenticateToken, requireRole(['teacher', 'admin']), upload.single('homeworkFile'), async (req, res) => {
  const { title, subject, dueDate, description } = req.body;

  if (!title || !subject || !dueDate) {
    return res.status(400).json({ error: 'يرجى إدخال العنوان والمادة وتاريخ التسليم.' });
  }

  try {
    const hwId = 'hw_' + Date.now();
    const filePath = req.file ? req.file.filename : null;
    const fileName = req.file ? req.file.originalname : null;

    await dbRun(`
      INSERT INTO homeworks (id, title, subject, due_date, description, file_path, file_name, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      hwId,
      title,
      subject,
      dueDate,
      description || '',
      filePath,
      fileName,
      req.user.id
    ]);

    return res.status(201).json({ message: 'تم نشر وتوزيع الواجب للأطفال بنجاح!' });
  } catch (error) {
    console.error('Publish homework failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء نشر الواجب.' });
  }
});

// 2. Student/Parent/Teacher: Get Homeworks list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const homeworks = await dbAll('SELECT * FROM homeworks ORDER BY created_at DESC');
    
    // If student/parent is calling, map submission status from database
    if (req.user.role === 'parent') {
      const submissions = await dbAll('SELECT homework_id, graded, grade FROM solutions WHERE student_id = ?', [req.user.id]);
      
      const enrichedHw = homeworks.map(hw => {
        const sub = submissions.find(s => s.homework_id === hw.id);
        return {
          ...hw,
          status: sub ? (sub.graded ? 'graded' : 'submitted') : 'pending',
          grade: sub ? sub.grade : null
        };
      });
      return res.json({ homeworks: enrichedHw });
    }

    return res.json({ homeworks });
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء تحميل الواجبات.' });
  }
});

// 3. Parent/Student: Submit Solution for Homework
router.post('/:id/submit', authenticateToken, requireRole(['parent']), uploadLimiter, (req, res) => {
  upload.single('solutionFile')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'يرجى إرفاق ملف الحل أولاً.' });
    }

    const homeworkId = req.params.id;

    try {
      // Check if homework exists
      const hw = await dbGet('SELECT id FROM homeworks WHERE id = ?', [homeworkId]);
      if (!hw) {
        return res.status(404).json({ error: 'الواجب غير موجود.' });
      }

      // Check if solution already submitted
      const existingSub = await dbGet('SELECT id FROM solutions WHERE homework_id = ? AND student_id = ?', [homeworkId, req.user.id]);
      if (existingSub) {
        return res.status(400).json({ error: 'لقد قمت بتسليم حل لهذا الواجب بالفعل.' });
      }

      const subId = 'sub_' + Date.now();
      await dbRun(`
        INSERT INTO solutions (id, homework_id, student_id, file_path, file_name)
        VALUES (?, ?, ?, ?, ?)
      `, [
        subId,
        homeworkId,
        req.user.id,
        req.file.filename,
        req.file.originalname
      ]);

      return res.status(201).json({ message: 'تم رفع وتسليم الحل بنجاح للمدرس!' });
    } catch (error) {
      console.error('Solution submit failed:', error.message);
      return res.status(500).json({ error: 'حدث خطأ أثناء تسليم الواجب.' });
    }
  });
});

// 4. Teacher: View Homework Submissions
router.get('/:id/solutions', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const solutions = await dbAll(`
      SELECT s.*, u.name as student_name 
      FROM solutions s 
      JOIN users u ON s.student_id = u.id 
      WHERE s.homework_id = ?
    `, [req.params.id]);

    return res.json({ solutions });
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء استيراد الحلول.' });
  }
});

// 5. Teacher: Grade Student Solution & Reward Star Points
router.post('/solutions/:subId/grade', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  const { grade, comment } = req.body;
  const subId = req.params.subId;

  if (!grade) {
    return res.status(400).json({ error: 'يرجى إدخال التقييم/التقدير.' });
  }

  try {
    const solution = await dbGet('SELECT * FROM solutions WHERE id = ?', [subId]);
    if (!solution) {
      return res.status(404).json({ error: 'الملف المرفوع للحل غير موجود.' });
    }

    if (solution.graded) {
      return res.status(400).json({ error: 'تم تقييم هذا الحل مسبقاً.' });
    }

    // 1. Update Solution Grade
    await dbRun(`
      UPDATE solutions 
      SET graded = 1, grade = ?, teacher_comment = ? 
      WHERE id = ?
    `, [grade, comment || '', subId]);

    // 2. Reward Kid with Star Points (+10 Stars)
    await dbRun(`
      UPDATE users 
      SET points = points + 10 
      WHERE id = ?
    `, [solution.student_id]);

    return res.json({ message: 'تم تصحيح الواجب بنجاح وإرسال 10 نجوم ذهبية مكافأة للطالب!' });
  } catch (error) {
    console.error('Grading failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ أثناء رصد التقييم.' });
  }
});

export default router;
