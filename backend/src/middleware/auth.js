import jwt from 'jsonwebtoken';

// Cryptographic secret key fallback for JWT signing
export const JWT_SECRET = process.env.JWT_SECRET || 'lsa_super_secret_cryptographic_key_9912';

// 1. Authenticate Token Middleware (Extracts JWT from Secure HttpOnly Cookies)
export const authenticateToken = (req, res, next) => {
  // Extract token from HTTP HttpOnly cookies first, fallback to Auth header
  let token = req.cookies?.token;

  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'عذراً، يجب تسجيل الدخول للوصول إلى هذا المورد.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
      studentCode: decoded.studentCode,
      childName: decoded.childName
    };
    next();
  } catch (error) {
    console.error('JWT Verification failed:', error.message);
    return res.status(403).json({ error: 'جلسة العمل منتهية أو الرمز غير صالح، يرجى تسجيل الدخول مجدداً.' });
  }
};

// 2. Role-Based Access Control (RBAC) Guard Middleware
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'المستخدم غير مصرح له.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'عذراً، ليس لديك الصلاحية للقيام بهذا الإجراء.' });
    }

    next();
  };
};
