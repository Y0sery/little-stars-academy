import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & Database initialization
import { initDatabase } from './src/config/db.js';

// Routers
import authRoutes from './src/routes/authRoutes.js';
import homeworkRoutes from './src/routes/homeworkRoutes.js';
import watermarkRoutes from './src/routes/watermarkRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import recordingRoutes from './src/routes/recordingRoutes.js';

// Socket Service
import { initChatService } from './src/services/chatService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Dynamic allowed origins for development & production
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Initialize Socket.io with secure CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure Global Security Headers via Helmet (with CSP customization for video sources)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      mediaSrc: ["'self'", "https://commondatastorage.googleapis.com", "blob:"],
      connectSrc: ["'self'", "ws://localhost:5000", "http://localhost:5000", ...allowedOrigins]
    }
  }
}));

// Configure CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// JSON body and Cookies parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder serving for uploaded files (secured inside route downloader for role verification, but public assets remain here)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/watermark', watermarkRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', recordingRoutes);

// Base route checker
app.get('/', (req, res) => {
  res.json({ message: 'أكاديمية النجوم الصغار - الخادم يعمل بنجاح 🚀' });
});

// Register real-time Socket Chat service
initChatService(io);

// Global Error Boundary Middleware (Clean code practice)
app.use((err, req, res, next) => {
  console.error('Unhandled Error Exception:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'حدث خطأ غير متوقع في الخادم.'
  });
});

// Start the Express HTTP + WebSocket Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Ensure SQLite schema and triggers are fully configured first
    await initDatabase();

    // 2. Boot HTTP server
    httpServer.listen(PORT, () => {
      console.log(`--------------------------------------------------`);
      console.log(`Little Stars Backend Server listening on PORT: ${PORT}`);
      console.log(`Mode: DEVELOPMENT / REST API & Socket.io Ready`);
      console.log(`--------------------------------------------------`);
    });
  } catch (error) {
    console.error('Fatal: Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
