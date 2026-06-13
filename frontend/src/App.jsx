import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import MainLayout  from './components/layout/MainLayout';
import LoginPage   from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage    from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

/* ─── Auth routes với fade+slide transition ───────────────────── */
function AuthRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </AnimatePresence>
  );
}

/* ─── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — không có Navbar */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App pages — có Navbar qua MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/explore"   element={<PlaceholderPage title="Khám phá" />} />
          <Route path="/community" element={<PlaceholderPage title="Cộng đồng" />} />
          <Route path="/reels"     element={<PlaceholderPage title="Thước phim" />} />
          <Route path="/events"    element={<PlaceholderPage title="Sự kiện" />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/settings"  element={<PlaceholderPage title="Cài đặt" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* Placeholder nhanh cho các trang chưa xây dựng */
function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#161d1b' }}>{title}</h1>
      <p style={{ color: '#3c4947', marginTop: 8 }}>Trang này đang được xây dựng.</p>
    </div>
  );
}
