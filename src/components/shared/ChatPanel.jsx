import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { SOCKET_URL } from '../../config/api';
import { Send, Wifi, WifiOff } from 'lucide-react';

export default function ChatPanel({ sessionId = 'live-class-math' }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Connect to backend Socket.io server
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        user: user || { id: 'guest_' + Date.now(), name: 'طالب زائر', role: 'parent' }
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected, joining room:', sessionId);
      socket.emit('joinRoom', { sessionId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 1. Receive chat history from SQLite database
    socket.on('chatHistory', (history) => {
      if (Array.isArray(history) && history.length > 0) {
        const formatted = history.map((msg, index) => ({
          id: 'hist_' + index + '_' + Date.now(),
          senderName: msg.senderName,
          text: msg.text,
          timestamp: msg.timestamp || '04:00 م',
          role: msg.role,
          isMe: msg.senderName === user?.name
        }));
        setMessages(formatted);
      } else {
        // Starter messages if chat is empty
        setMessages([
          { id: 1, senderName: 'الأستاذة سارة أحمد', text: 'أهلاً بكم يا أبطال في حصة اليوم! هل أنتم مستعدون؟ 🌟', timestamp: '04:00 م', isMe: false, role: 'teacher' }
        ]);
      }
    });

    // 2. Receive new real-time message from any participant
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          senderName: msg.senderName,
          text: msg.text,
          timestamp: msg.timestamp,
          role: msg.role,
          isMe: msg.senderName === user?.name || msg.senderId === user?.id
        }
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageText = inputText.trim();

    // Emit real-time message to server (persisted in SQLite & broadcasted)
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', {
        sessionId,
        text: messageText
      });
    } else {
      // Local fallback if socket disconnected
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderName: user?.name || 'زائر',
          text: messageText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          role: user?.role || 'parent'
        }
      ]);
    }

    setInputText('');
  };

  return (
    <div className="live-chat-sidebar">
      {/* Chat Title bar */}
      <div className="chat-header">
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>محادثة الحصة التفاعلية</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', marginTop: '2px', color: isConnected ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
            <span>{isConnected ? 'متصل لحظياً بالخادم' : 'جاري الاتصال بالسيرفر...'}</span>
          </div>
        </div>
        <span className="badge badge-secondary" style={{ fontSize: '10px' }}>
          {messages.length} رسالة
        </span>
      </div>

      {/* Messages viewport */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`chat-message-bubble ${msg.isMe ? 'me' : ''}`}
          >
            <span className="chat-sender" style={{
              color: msg.role === 'teacher' ? 'var(--color-secondary)' : '#28b381',
              fontWeight: 'bold'
            }}>
              {msg.senderName} {msg.role === 'teacher' && '👑 (المعلم)'}
            </span>
            <p style={{ margin: 0, wordBreak: 'break-word', color: 'var(--color-text-dark)' }}>{msg.text}</p>
            <span style={{ fontSize: '9px', color: 'var(--color-text-light)', display: 'block', textAlign: 'left', marginTop: '2px' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Text input area - Strictly NO edit/delete keys or states */}
      <form onSubmit={handleSendMessage} className="chat-input-area">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب رسالتك التفاعلية هنا..."
          className="chat-input"
        />
        <button type="submit" className="btn btn-secondary btn-icon" style={{ borderRadius: 'var(--radius-sm)' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
