'use client';

import { useState, useEffect } from 'react';

export default function ProductForm({ editingProduct, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category_id: '',
    brand_id: '',
    description: '',
    status: 1,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = 'http://127.0.0.1:8000/api';

  // Load danh mục & thương hiệu làm dropdown chọn lựa
  useEffect(() => {
    queueMicrotask(() => {
      const fetchDropdownData = async () => {
        try {
          const [resCate, resBrand] = await Promise.all([
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/brands`),
          ]);
          const dataCate = await resCate.json();
          const dataBrand = await resBrand.json();

          setCategories(dataCate.data || dataCate);
          setBrands(dataBrand.data || dataBrand);
        } catch (err) {
          console.error('Lỗi tải dữ liệu danh mục/thương hiệu:', err);
        }
      };
      fetchDropdownData();
    });
  }, []);

  // Điền dữ liệu khi ở chế độ Sửa
  useEffect(() => {
    if (editingProduct) {
      queueMicrotask(() => {
        setFormData({
          name: editingProduct.name || '',
          price: editingProduct.price || '',
          quantity: editingProduct.quantity || '',
          category_id: editingProduct.category_id || '',
          brand_id: editingProduct.brand_id || '',
          description: editingProduct.description || '',
          status: editingProduct.status ?? 1,
        });
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const isEdit = !!editingProduct;

    const url = isEdit
      ? `${API_URL}/admin/products/${editingProduct.id}`
      : `${API_URL}/admin/products`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        onSuccess();
      } else {
        alert(result.message || 'Thao tác thất bại!');
      }
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="font-bold text-gray-800 text-lg">
          {editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </h3>
        {editingProduct && (
          <button type="button" onClick={onCancel} className="text-xs text-gray-500 hover:underline">
            Hủy sửa
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Tên sản phẩm *</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="VD: Laptop Dell XPS 13"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Giá bán (VNĐ) *</label>
          <input
            type="number"
            name="price"
            required
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="15000000"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Số lượng *</label>
          <input
            type="number"
            name="quantity"
            required
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Danh mục *</label>
          <select
            name="category_id"
            required
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Thương hiệu *</label>
          <select
            name="brand_id"
            required
            value={formData.brand_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả sản phẩm</label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Thông tin chi tiết về sản phẩm..."
        ></textarea>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Trạng thái</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value={1}>Mở bán (Hiển thị)</option>
          <option value={0}>Tạm ẩn</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 font-semibold py-2.5 rounded-xl text-white text-sm transition ${
            editingProduct ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Đang lưu...' : editingProduct ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
        </button>

        {editingProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}