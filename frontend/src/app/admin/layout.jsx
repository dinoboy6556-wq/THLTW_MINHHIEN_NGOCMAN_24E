'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');

    if (!token || user.role !== 'admin') {
      alert('Vui lòng đăng nhập tài khoản Admin!');
      router.push('/login');
    } else {
      // Dùng queueMicrotask để tránh gọi setState đồng bộ trong Effect
      queueMicrotask(() => {
        setAdminUser(user);
      });
    }
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      router.push('/login');
    }
  };

  const navItems = [
    { name: 'Tổng quan', path: '/admin' },
    { name: 'Quản lý Danh mục', path: '/admin/categories' },
    { name: 'Quản lý Thương hiệu', path: '/admin/brands' },
    { name: 'Quản lý Sản phẩm', path: '/admin/products' },
  ];

  if (!adminUser) return <div className="p-8 text-center text-gray-500">Đang kiểm tra quyền truy cập...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div>
          <div className="text-xl font-bold p-3 border-b border-slate-700 text-indigo-400">
            SHOP ADMIN
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* NÚT ĐĂNG XUẤT */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
        >
          Đăng xuất
        </button>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Trang Quản Trị Hệ Thống</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Xin chào, <b>{adminUser.username}</b></span>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase">
              {adminUser.role}
            </span>
          </div>
        </header>

        {/* NỘI DUNG TRANG */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}