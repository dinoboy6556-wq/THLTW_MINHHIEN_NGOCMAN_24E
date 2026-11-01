'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { login, password });
      const data = response.data;

      if (data.success) {
        // Lưu Bearer Token và Thông tin User vào localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_info', JSON.stringify(data.user));

        // Phân luồng điều hướng theo Role
        if (['admin', 'super_admin'].includes(data.user.role)) {
          router.push('/admin');
        } else {
          const redirect = new URLSearchParams(window.location.search).get('redirect');
          const returnPath =
            redirect?.startsWith('/') && !redirect.startsWith('//')
              ? redirect
              : '/';
          router.push(returnPath);
        }
      } else {
        setError(data.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể kết nối tới máy chủ Backend Laravel!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập Hệ Thống</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập hoặc Email</label>
            <input
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-gray-800"
              placeholder="VD: admin_test"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 mt-2 disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            onClick={(event) => {
              const redirect = new URLSearchParams(window.location.search).get('redirect');
              if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
                event.preventDefault();
                router.push(`/register?redirect=${encodeURIComponent(redirect)}`);
              }
            }}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
