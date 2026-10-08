import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { dbRun, dbAll } from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';

// Setup WebSocket Chat & WebRTC Live Streaming signaling logic
export const initChatService = (io) => {
  // Authentication middleware inside Socket.io connections
  io.use((socket, next) => {
    try {
      const cookiesHeader = socket.handshake.headers.cookie || '';
      const cookies = cookie.parse(cookiesHeader);
      const token = cookies.token || socket.handshake.auth?.token;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          socket.user = {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role
          };
          return next();
        } catch (jwtErr) {
          console.warn('Socket token verify failed, checking fallback user payload');
        }
      }

      // Fallback for role-switcher / dev demo mode
      if (socket.handshake.auth?.user) {
        socket.user = {
          id: socket.handshake.auth.user.id || 'user_' + socket.id,
          name: socket.handshake.auth.user.name || 'مستخدم',
          role: socket.handshake.auth.user.role || 'parent'
        };
        return next();
      }

      // Default guest fallback
      socket.user = {
        id: 'guest_' + socket.id,
        name: 'طالب زائر',
        role: 'parent'
      };
      next();
    } catch (err) {
      console.error('Socket authentication exception:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to Socket: ${socket.user.name} (${socket.user.role}) [id: ${socket.id}]`);

    // 1. Join room (session)
    socket.on('joinRoom', async ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(sessionId);

      // Notify others in the room of a new participant
      socket.to(sessionId).emit('user-joined', {
        socketId: socket.id,
        user: socket.user
      });

      try {
        // Load past messages for this session from SQLite DB
        const messages = await dbAll(
          'SELECT sender_name as senderName, text, created_at as timestamp, role FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
          [sessionId]
        );
        socket.emit('chatHistory', messages);
      } catch (err) {
        console.error('Failed to load chat history:', err.message);
      }
    });

    // 2. Real-Time Chat Message Handler (Strictly NO edit/delete)
    socket.on('sendMessage', async ({ sessionId, text }) => {
      if (!sessionId || !text || !text.trim()) return;

      try {
        const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        
        // 1. Write message to database (Trigger protects it from edits/deletes)
        await dbRun(`
          INSERT INTO chat_messages (session_id, sender_name, sender_id, text, role)
          VALUES (?, ?, ?, ?, ?)
        `, [
          sessionId,
          socket.user.name,
          socket.user.id,
          text.trim(),
          socket.user.role
        ]);

        // 2. Broadcast message back to the active session room
        io.to(sessionId).emit('receiveMessage', {
          senderName: socket.user.name,
          text: text.trim(),
          timestamp: timestamp,
          role: socket.user.role,
          senderId: socket.user.id
        });

      } catch (err) {
        console.error('Failed to save and broadcast chat message:', err.message);
        socket.emit('chatError', { error: 'عذراً، فشل إرسال الرسالة.' });
      }
    });

    // 3. WebRTC Live Streaming Signaling
    // Teacher announces live stream is starting
    socket.on('stream-started', ({ sessionId }) => {
      console.log(`Live stream started in room: ${sessionId} by ${socket.user.name}`);
      socket.to(sessionId).emit('stream-started', {
        teacherSocketId: socket.id,
        teacherName: socket.user.name
      });
    });

    // Teacher sends SDP Offer to a specific student or room
    socket.on('webrtc-offer', ({ targetSocketId, offer, sessionId }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-offer', {
          offer,
          teacherSocketId: socket.id
        });
      } else if (sessionId) {
        socket.to(sessionId).emit('webrtc-offer', {
          offer,
          teacherSocketId: socket.id
        });
      }
    });

    // Student sends SDP Answer back to the Teacher
    socket.on('webrtc-answer', ({ teacherSocketId, answer }) => {
      io.to(teacherSocketId).emit('webrtc-answer', {
        answer,
        studentSocketId: socket.id,
        studentName: socket.user.name
      });
    });

    // ICE Candidate exchange
    socket.on('webrtc-candidate', ({ targetSocketId, candidate, sessionId }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-candidate', {
          candidate,
          fromSocketId: socket.id
        });
      } else if (sessionId) {
        socket.to(sessionId).emit('webrtc-candidate', {
          candidate,
          fromSocketId: socket.id
        });
      }
    });

    // Teacher announces stream finished
    socket.on('stream-ended', ({ sessionId }) => {
      console.log(`Live stream ended in room: ${sessionId}`);
      io.to(sessionId).emit('stream-ended');
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from Socket: ${socket.user.name} [id: ${socket.id}]`);
    });
  });
};
