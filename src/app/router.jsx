import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Lazy load or direct import of pages
import Home from '../pages/Home';
import Courses from '../pages/Courses';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ParentDashboard from '../pages/ParentDashboard';
import HomeworkPage from '../pages/HomeworkPage';
import TeacherHomeworkPage from '../pages/TeacherHomeworkPage';
import LiveSession from '../pages/LiveSession';
import TeacherProfile from '../pages/TeacherProfile';
import FAQ from '../pages/FAQ';
import PrivacyPolicy from '../pages/AppPolicy';
import AdminDashboard from '../pages/AdminDashboard';
import Unauthorized from '../pages/Unauthorized';
import CourseRecordings from '../pages/CourseRecordings';

// Protected Route Wrapper with RBAC
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If not authorized for this role, render Unauthorized access warning
    return <Unauthorized allowedRoles={allowedRoles} />;
  }

  return children;
};

// Dynamic Dashboard Router based on current user role
const DashboardHome = () => {
  const { user } = useAuthStore();

  if (user?.role === 'teacher') {
    return <TeacherHomeworkPage />;
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // default to parent/student dashboard
  return <ParentDashboard />;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/teachers/:teacherId" element={<TeacherProfile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      {/* Protected Routes (Parent & Student) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/homework"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <HomeworkPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes (Teacher & Admin) */}
      <Route
        path="/dashboard/teacher-homework"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherHomeworkPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Live Interactive Session (Access for Parent, Student, Teacher, Admin) */}
      <Route
        path="/session/:sessionId"
        element={
          <ProtectedRoute>
            <LiveSession />
          </ProtectedRoute>
        }
      />

      {/* Protected Course Recorded Lectures */}
      <Route
        path="/courses/:courseId/recordings"
        element={
          <ProtectedRoute>
            <CourseRecordings />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export { ProtectedRoute };
