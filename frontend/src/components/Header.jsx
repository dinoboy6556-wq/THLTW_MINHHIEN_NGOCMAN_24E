'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        // Bọc trong queueMicrotask để tránh gọi setState đồng bộ trực tiếp trong useEffect
        queueMicrotask(() => {
          setUser(parsedUser);
        });
      } catch (err) {
        console.error('Lỗi parse thông tin user:', err);
      }
    }
  }, []);

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
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          MYSHOP
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-indigo-600 transition">Trang chủ</Link>
          <Link href="/products" className="hover:text-indigo-600 transition">Sản phẩm</Link>
          <Link href="/categories" className="hover:text-indigo-600 transition">Danh mục</Link>
          <Link href="/brands" className="hover:text-indigo-600 transition">Thương hiệu</Link>
        </nav>

        {/* CART & USER ACTIONS */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-gray-700 hover:text-indigo-600 font-medium text-sm flex items-center gap-1">
            🛒 Giỏ hàng
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              {user.role === 'admin' && (
                <Link href="/admin" className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-bold">
                  Quản trị
                </Link>
              )}
              <span className="text-sm text-gray-700 font-medium">{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition font-medium"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}