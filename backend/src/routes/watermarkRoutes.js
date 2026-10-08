import express from 'express';
import jwt from 'jsonwebtoken';
import { dbGet } from '../config/db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Mock static database mapping of course sessions to their active teachers
const MOCK_SESSION_TEACHERS = {
  'live-class-math': { teacherId: 'teacher_789', code: 'LSA-TEACHER-SARA-9942' },
  'live-class-math-1': { teacherId: 'teacher_789', code: 'LSA-TEACHER-SARA-9942' },
  'live-class-math-2': { teacherId: 'teacher_789', code: 'LSA-TEACHER-SARA-9942' },
  'live-class-science-1': { teacherId: 'teacher_abc', code: 'LSA-TEACHER-KHALED-1140' },
  'live-class-code-1': { teacherId: 'teacher_xyz', code: 'LSA-TEACHER-AHMED-3809' }
};

// 1. Get short-lived, signed cryptographic token for visual watermark drawing
router.get('/session/:sessionId/watermark', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Find the session teacher tracking code
    const sessionInfo = MOCK_SESSION_TEACHERS[sessionId] || { teacherId: 'teacher_789', code: 'LSA-TEACHER-SARA-9942' };

    // Create a payload that links the current student playing the stream, the teacher owning it, and timestamp
    const watermarkPayload = {
      sessionId: sessionId,
      studentId: req.user.id,
      studentName: req.user.name,
      teacherTrackingCode: sessionInfo.code, // Secret leak code signature
      timestamp: Date.now()
    };

    // Sign the token with a very short expiry (e.g. 5 minutes)
    // This makes it short-lived and secure against replay/DOM modification.
    const signedToken = jwt.sign(watermarkPayload, JWT_SECRET, { expiresIn: '5m' });

    // Send the token in base64 format (which can be passed easily to the canvas player)
    // We encode the signedToken in standard base64 so it can be unpacked by the client canvas.
    const encodedToken = Buffer.from(signedToken).toString('base64');

    return res.json({ token: encodedToken });
  } catch (error) {
    console.error('Failed to generate watermark token:', error.message);
    return res.status(500).json({ error: 'فشل إنشاء رمز التحقق للمشغل المائي.' });
  }
});

export default router;
