import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../config/db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// 1. User Registration (Parent/Student)
router.post('/register', authLimiter, async (req, res) => {
  const { parentName, whatsapp, studentCode, email, password } = req.body;

  if (!parentName || !email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال الحقول المطلوبة: الاسم، البريد الإلكتروني، وكلمة المرور.' });
  }

  try {
    // Check if email already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر.' });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'parent_' + Date.now();

    // Insert user into SQLite
    await dbRun(`
      INSERT INTO users (id, name, email, password, role, whatsapp, student_code, child_name, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      parentName,
      email,
      hashedPassword,
      'parent',
      whatsapp || '',
      studentCode || '',
      'طفلي الصغير', // default placeholder for child name
      10 // starter stars points!
    ]);

    return res.status(201).json({ message: 'تم إنشاء الحساب وتفعيل كود الطالب بنجاح!' });
  } catch (error) {
    console.error('Registration failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إنشاء الحساب.' });
  }
});

// 2. User Login (Parent, Teacher, or Admin)
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' });
  }

  try {
    // Find user in DB
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        studentCode: user.student_code,
        childName: user.child_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in Secure HttpOnly Cookie (prevent XSS token harvesting)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return sanitized user details
    return res.json({
      message: 'تم تسجيل الدخول بنجاح!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        childName: user.child_name,
        points: user.points,
        studentCode: user.student_code
      }
    });

  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول.' });
  }
});

// 3. User Session Verification (me)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, role, child_name, points, student_code FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود.' });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء استرداد بيانات الجلسة.' });
  }
});

// 4. Logout (Clear HttpOnly Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'تم تسجيل الخروج بنجاح.' });
});

export default router;
