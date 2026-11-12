import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { FormPage } from './pages/FormPage';
import { DashboardPage } from './pages/DashboardPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('mmp_bstb_auth') === 'true';
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* LINK 1: Link Utama Bawaan Aplikasi Khusus Buat LOGIN ADMIN */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<LoginPage />} />

        {/* LINK 2: Link Khusus Buat FORM BSTB Karyawan (Tanpa Login) */}
        <Route path="/form" element={<FormPage />} />

        {/* DASHBOARD ADMIN (Setelah Login) */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
