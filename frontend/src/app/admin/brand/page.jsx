'use client';

import { useState, useEffect } from 'react';

export default function AdminBrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho Form Thêm/Sửa
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);

  // States cho Tìm kiếm, Lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_URL = 'http://127.0.0.1:8000/api';

  // Tải danh sách thương hiệu từ Backend
  const loadBrands = async () => {
    try {
      const res = await fetch(`${API_URL}/brands`);
      const data = await res.json();
      setBrands(data.data || data);
    } catch (err) {
      console.error('Lỗi lấy danh sách thương hiệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      loadBrands();
    });
  }, []);

  // Reset Form về trạng thái ban đầu
  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus(1);
    setEditingId(null);
  };

  // Chọn thương hiệu để Sửa
  const handleEditClick = (brand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setDescription(brand.description || '');
    setStatus(brand.status ?? 1);
  };

  // Xử lý Gửi Form (Thêm mới HOẶC Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const isEdit = !!editingId;

    const url = isEdit
      ? `${API_URL}/admin/brands/${editingId}`
      : `${API_URL}/admin/brands`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, status: Number(status) }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(isEdit ? 'Cập nhật thương hiệu thành công!' : 'Thêm thương hiệu thành công!');
        resetForm();
        loadBrands();
      } else {
        alert(result.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Lỗi gửi form thương hiệu:', err);
    }
  };

  // Xử lý Xóa Thương hiệu
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/admin/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Đã xóa thương hiệu thành công!');
        if (editingId === id) resetForm();
        loadBrands();
      } else {
        const result = await res.json();
        alert(result.message || 'Không thể xóa thương hiệu này!');
      }
    } catch (err) {
      console.error('Lỗi xóa thương hiệu:', err);
    }
  };

  // LOGIC TÌM KIẾM & LỌC
  const filteredBrands = brands.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || String(brand.status) === String(statusFilter);

    return matchesSearch && matchesStatus;
  });

  // LOGIC PHÂN TRANG
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản Lý Thương Hiệu</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= FORM THÊM / SỬA ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? 'Cập Nhật Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên thương hiệu *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: ASUS, Apple, Dell"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Mô tả thương hiệu..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 font-medium py-2 rounded-lg transition text-white ${
                  editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {editingId ? 'Lưu Thay Đổi' : 'Thêm Thương Hiệu'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-700 text-sm font-medium transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ================= BẢNG DANH SÁCH & THANH CÔNG CỤ ================= */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* THANH TÌM KIẾM & LỌC */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm thương hiệu..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>

            {/* Lọc trạng thái */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Đang hiển thị</option>
                <option value="0">Đang ẩn</option>
              </select>
            </div>
          </div>

          {/* BẢNG DỮ LIỆU */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Đang tải danh sách thương hiệu...</div>
            ) : paginatedBrands.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Không tìm thấy thương hiệu phù hợp.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-4">ID</th>
                    <th className="p-4">Tên thương hiệu</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {paginatedBrands.map((brand) => (
                    <tr
                      key={brand.id}
                      className={`hover:bg-gray-50 transition ${
                        editingId === brand.id ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-gray-700">{brand.id}</td>
                      <td className="p-4 text-gray-800 font-medium">
                        <div>{brand.name}</div>
                        {brand.description && (
                          <div className="text-xs text-gray-400 font-normal line-clamp-1">
                            {brand.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{brand.slug}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            brand.status == 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {brand.status == 1 ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(brand)}
                            className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* THANH PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredBrands.length)} / {filteredBrands.length} thương hiệu
                </span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1 border rounded-md text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 bg-white"
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1 border rounded-md text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 bg-white"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}