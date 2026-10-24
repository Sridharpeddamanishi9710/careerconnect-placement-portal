import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DrivesList from './pages/admin/DrivesList';
import DriveDetail from './pages/admin/DriveDetail';
import ApplicationsList from './pages/admin/ApplicationsList';
import StudentsList from './pages/admin/StudentsList';
import CompaniesList from './pages/admin/CompaniesList';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableDrives from './pages/student/AvailableDrives';
import MyApplications from './pages/student/MyApplications';
import Profile from './pages/student/Profile';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated 
            ? <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
            : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated 
            ? <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
            : <Register />
        } />

        {/* Root Redirect */}
        <Route path="/" element={
          isAuthenticated 
            ? <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
            : <Navigate to="/login" replace />
        } />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/drives" element={<DrivesList />} />
            <Route path="/admin/drives/:id" element={<DriveDetail />} />
            <Route path="/admin/applications" element={<ApplicationsList />} />
            <Route path="/admin/students" element={<StudentsList />} />
            <Route path="/admin/companies" element={<CompaniesList />} />
          </Route>
        </Route>

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/drives" element={<AvailableDrives />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
