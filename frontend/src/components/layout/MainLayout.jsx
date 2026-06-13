import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * MainLayout — layout wrapper dùng cho tất cả trang sau khi đăng nhập.
 * Navbar cố định trên cùng, nội dung trang render qua <Outlet />.
 */
export default function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
