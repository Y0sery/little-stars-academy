import rateLimit from 'express-rate-limit';

// Rate Limiter for Authentication endpoints (prevent Brute-Force login attacks)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: {
    error: 'لقد قمت بمحاولات تسجيل دخول متعددة. يرجى الانتظار 15 دقيقة ثم المحاولة مجدداً لسلامة حسابك.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate Limiter for File Uploads (prevent resource/Disk storage exhaustion attacks)
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 homework uploads per 10 minutes
  message: {
    error: 'لقد تجاوزت الحد المسموح لرفع الملفات. يمكنك المحاولة مجدداً بعد 10 دقائق.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
