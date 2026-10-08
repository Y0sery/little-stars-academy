import express from 'express';
import { dbAll, dbRun, dbGet } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Public / Logged In: Fetch all courses
router.get('/', async (req, res) => {
  try {
    const courses = await dbAll('SELECT * FROM courses ORDER BY created_at DESC');
    return res.json({ courses });
  } catch (error) {
    console.error('Failed to fetch courses:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تحميل الكورسات.' });
  }
});

// 2. Admin Only: Add new course
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { title, subject, ageGroup, price, imageUrl, teacherName } = req.body;

  if (!title || !subject || !ageGroup || !price || !teacherName) {
    return res.status(400).json({ error: 'الرجاء إدخال الحقول المطلوبة: العنوان، المادة، الفئة العمرية، السعر، واسم المدرس.' });
  }

  try {
    const id = 'course_' + Date.now();
    
    // Format EGP price tag if not present
    let formattedPrice = price;
    if (!price.includes('ج.م')) {
      formattedPrice = `${price} ج.م`;
    }

    await dbRun(`
      INSERT INTO courses (id, title, subject, age_group, price, image_url, teacher_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      title,
      subject,
      ageGroup,
      formattedPrice,
      imageUrl || 'https://images.unsplash.com/photo-1453733190148-c44698c26578?auto=format&fit=crop&w=400&q=80',
      teacherName
    ]);

    const newCourse = await dbGet('SELECT * FROM courses WHERE id = ?', [id]);
    return res.status(201).json({ message: 'تم إضافة الكورس بنجاح!', course: newCourse });
  } catch (error) {
    console.error('Add course failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إضافة الكورس.' });
  }
});

// 3. Admin Only: Edit course price
router.put('/:id/price', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { price } = req.body;
  const { id } = req.params;

  if (!price) {
    return res.status(400).json({ error: 'يرجى تحديد السعر الجديد.' });
  }

  try {
    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ error: 'الكورس غير موجود.' });
    }

    let formattedPrice = price;
    if (!price.includes('ج.م')) {
      formattedPrice = `${price} ج.م`;
    }

    await dbRun('UPDATE courses SET price = ? WHERE id = ?', [formattedPrice, id]);
    
    return res.json({ message: 'تم تحديث السعر بنجاح!', newPrice: formattedPrice });
  } catch (error) {
    console.error('Update price failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تحديث السعر.' });
  }
});

// 4. Admin Only: Delete course
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const course = await dbGet('SELECT id FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ error: 'الكورس غير موجود.' });
    }

    await dbRun('DELETE FROM courses WHERE id = ?', [id]);
    return res.json({ message: 'تم حذف الكورس بنجاح من النظام.' });
  } catch (error) {
    console.error('Delete course failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء حذف الكورس.' });
  }
});

export default router;
