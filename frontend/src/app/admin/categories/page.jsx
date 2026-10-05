'use client';

import { useState, useEffect } from 'react';

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const API_URL = 'http://127.0.0.1:8000/api';

  // Hàm tải dữ liệu danh mục
  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data.data || data);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (!ignore) {
          setCategories(data.data || data);
        }
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  // Thêm Danh mục
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`${API_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, status: 1 }),
      });

      const result = await res.json();

      if (res.ok) {
        alert('Thêm danh mục thành công!');
        setName('');
        setDescription('');
        loadCategories(); // Tải lại bảng
      } else {
        alert(result.message || 'Thêm thất bại!');
      }
    } catch (err) {
      console.error('Lỗi thêm danh mục:', err);
    }
  };

  // Xóa Danh mục
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Đã xóa thành công!');
        loadCategories(); // Tải lại bảng
      } else {
        const result = await res.json();
        alert(result.message || 'Không thể xóa danh mục này!');
      }
    } catch (err) {
      console.error('Lỗi xóa danh mục:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản Lý Danh Mục</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM THÊM DANH MỤC */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Thêm Danh Mục Mới</h3>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Màn Hình"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
            >
              Thêm Danh Mục
            </button>
          </form>
        </div>

        {/* BẢNG DANH SÁCH DANH MỤC */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Đang tải danh mục...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4">ID</th>
                  <th className="p-4">Tên danh mục</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{cat.id}</td>
                    <td className="p-4 text-gray-800 font-medium">{cat.name}</td>
                    <td className="p-4 text-gray-500">{cat.slug}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}