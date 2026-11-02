'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import menuService from '@/services/menuService';

const defaultMenuItems = [
  { label: 'Trang chủ', url: '/' },
  { label: 'Sản phẩm', url: '/products' },
  { label: 'Bài viết', url: '/posts' },
  { label: 'Danh mục', url: '/categories' },
  { label: 'Thương hiệu', url: '/brands' },
];

export default function Header() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
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

  useEffect(() => {
    let isMounted = true;

    menuService.getPublic().then((response) => {
      const items = response.data?.data;
      if (isMounted && Array.isArray(items)) setMenuItems(items);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const syncCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((count, item) => count + Number(item.quantity || 0), 0));
      } catch {
        setCartCount(0);
      }
    };

    queueMicrotask(syncCartCount);
    window.addEventListener('cartUpdated', syncCartCount);
    window.addEventListener('storage', syncCartCount);

    return () => {
      window.removeEventListener('cartUpdated', syncCartCount);
      window.removeEventListener('storage', syncCartCount);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
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
          {menuItems.map((item) => {
            const isExternal = /^https?:\/\//i.test(item.url);
            const className = "hover:text-indigo-600 transition";

            return isExternal ? (
              <a key={item.id || item.url} href={item.url} target={item.open_new_tab ? "_blank" : undefined} rel={item.open_new_tab ? "noopener noreferrer" : undefined} className={className}>
                {item.label}
              </a>
            ) : (
              <Link key={item.id || item.url} href={item.url} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CART & USER ACTIONS */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-gray-700 hover:text-indigo-600 font-medium text-sm flex items-center gap-1">
            🛒 Giỏ hàng
            {cartCount > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              {['admin', 'super_admin'].includes(user.role) && (
                <Link href="/admin" className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-bold">
                  Quản trị
                </Link>
              )}
              {user.role === 'member' && (
                <Link href="/favorites" className="text-sm font-medium text-gray-700 hover:text-pink-600">♡ Yêu thích</Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 text-sm text-gray-700 font-medium hover:text-indigo-600">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                  ) : (
                    user.username?.charAt(0)?.toUpperCase() || "U"
                  )}
                </span>
                Hồ sơ
              </Link>
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
