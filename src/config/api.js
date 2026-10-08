// Centralized API, Socket and WebRTC Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

// STUN and TURN ICE Servers for WebRTC live video streaming
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_SERVER
    ? [
        {
          urls: import.meta.env.VITE_TURN_SERVER,
          username: import.meta.env.VITE_TURN_USERNAME || '',
          credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
        }
      ]
    : [])
];
