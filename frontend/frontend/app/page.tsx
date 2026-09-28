'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resCategories] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);

        setProducts(resProducts.data.data);
        setCategories(resCategories.data.data);
      } catch (error) {
        console.error('Lỗi gọi API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Website Bán Hàng E-Commerce</h1>

      {/* Danh mục */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Danh Mục Sản Phẩm</h2>
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((cat) => (
            <span key={cat.id} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
              {cat.name}
            </span>
          ))}
        </div>
      </section>

      {/* Danh sách Sản phẩm */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Sản Phẩm Mới Nhất</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((item) => (
            <div key={item.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <img
                src={item.thumbnail || 'https://via.placeholder.com/300'}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
              <p className="text-red-600 font-bold mt-2">
                {Number(item.final_price).toLocaleString('vi-VN')} đ
              </p>
              {item.sale_price && (
                <p className="text-gray-400 text-sm line-through">
                  {Number(item.price).toLocaleString('vi-VN')} đ
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}