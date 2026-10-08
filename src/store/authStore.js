import { create } from 'zustand';

const MOCK_USERS = {
  parent: {
    id: 'parent_123',
    name: 'أبو أحمد (ولي الأمر)',
    role: 'parent',
    childName: 'أحمد',
    points: 150,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    badgeCount: 3,
  },
  teacher: {
    id: 'teacher_789',
    name: 'الأستاذة سارة',
    role: 'teacher',
    subject: 'الرياضيات والعلوم المبسطة',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    leakTrackingCode: 'LSA-TEACHER-SARA-9942', // The hidden watermark code
  },
  admin: {
    id: 'admin_001',
    name: 'مدير المنصة (أدمن)',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
  }
};

export const useAuthStore = create((set) => ({
  user: MOCK_USERS.parent, // default role is parent/student
  isAuthenticated: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  logout: () => set({ user: null, isAuthenticated: false }),
  
  // Custom helper to quickly switch roles in frontend for previewing/SaaS test
  switchRole: (role) => {
    if (MOCK_USERS[role]) {
      set({ user: MOCK_USERS[role], isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  }
}));
