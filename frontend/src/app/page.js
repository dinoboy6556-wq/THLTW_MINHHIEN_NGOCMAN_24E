"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";
import { getErrorMessage } from "@/lib/axios";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm bóc tách Mảng an toàn theo mọi cấu trúc API Laravel
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && Array.isArray(resData.data.data)) return resData.data.data;
    return [];
  };

  // Tải dữ liệu trang chủ (Dùng queueMicrotask để tránh lỗi Linter render đồng bộ)
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const [resProd, resCat, resBrand] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          brandService.getAll(),
        ]);

        if (isMounted) {
          setProducts(extractArray(resProd.data));
          setCategories(extractArray(resCat.data));
          setBrands(extractArray(resBrand.data));
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu trang chủ:", getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(() => {
      fetchHomeData();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const productList = Array.isArray(products) ? products : [];
  const categoryList = Array.isArray(categories) ? categories : [];
  const brandList = Array.isArray(brands) ? brands : [];

  // Lọc ra các sản phẩm mở bán (status = 1 hoặc true)
  const activeProducts = productList.filter(
    (p) => p.status === undefined || p.status == 1 || p.status === true
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-12 pb-16">
      {/* 1. HERO BANNER SECTION */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-6 sm:px-12 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <span className="bg-indigo-600/30 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full w-fit border border-indigo-500/30">
              Công Nghệ Đột Phá 2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Khám Phá Thiết Bị <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Công Nghệ Đỉnh Cao
              </span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Trải nghiệm các dòng Smartphone, Laptop, Tai nghe chính hãng với mức giá ưu đãi nhất cùng chính sách bảo hành uy tín 1 đổi 1.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/products"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-600/30"
              >
                Mua Ngay Hôm Nay
              </Link>
              <a
                href="#featured-categories"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm transition border border-white/10"
              >
                Xem Danh Mục
              </a>
            </div>
          </div>

          {/* Banner Visual / Cam kết dịch vụ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-bold text-white text-base">Giao Hàng Nhanh</h3>
              <p className="text-xs text-gray-400 mt-1">Miễn phí ship cho đơn hàng từ 1.000.000đ</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-bold text-white text-base">Bảo Hành 100%</h3>
              <p className="text-xs text-gray-400 mt-1">Cam kết sản phẩm chính hãng 100%</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-bold text-white text-base">1 Đổi 1 Trong 30 Ngày</h3>
              <p className="text-xs text-gray-400 mt-1">Đổi mới ngay nếu sản phẩm gặp lỗi nhà sản xuất</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-3xl mb-2">🎧</div>
              <h3 className="font-bold text-white text-base">Hỗ Trợ 24/7</h3>
              <p className="text-xs text-gray-400 mt-1">Đội ngũ kỹ thuật hỗ trợ nhiệt tình qua hotline</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-12">
        {/* 2. DANH MỤC NỔI BẬT */}
        <section id="featured-categories" className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Danh Mục Nổi Bật</h2>
              <p className="text-sm text-gray-500">Tìm kiếm theo nhu cầu của bạn</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : categoryList.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">Chưa có danh mục nào.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categoryList.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug || cat.id}`}
                  className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition text-center flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-lg font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 3. SẢN PHẨM MỚI NỔI BẬT */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Sản Phẩm Mới Nhất</h2>
              <p className="text-sm text-gray-500">Sản phẩm công nghệ hiện đại vừa cập bến</p>
            </div>
            <Link href="/products" className="text-indigo-600 hover:underline text-sm font-semibold">
              Xem tất cả &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border text-gray-500">
              Chưa có sản phẩm nào được mở bán.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {activeProducts.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition flex flex-col justify-between group"
                >
                  <div className="relative p-4 bg-gray-50 flex items-center justify-center h-48 overflow-hidden">
                    {product.promo_price && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        GIẢM GIÁ
                      </span>
                    )}

                    {product.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">No image</div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-indigo-600 transition">
                        <Link href={`/products/${product.slug || product.id}`}>{product.name}</Link>
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-1">{product.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {product.promo_price ? (
                          <div className="flex flex-col">
                            <span className="text-red-600 font-bold text-sm">
                              {Number(product.promo_price).toLocaleString("vi-VN")} đ
                            </span>
                            <span className="text-gray-400 text-xs line-through">
                              {Number(product.price).toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-800 font-bold text-sm">
                            {Number(product.price).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-2 rounded-lg text-xs font-semibold transition"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. THƯƠNG HIỆU ĐỒNG HÀNH */}
        <section className="flex flex-col gap-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Thương Hiệu Đồng Hành</h2>
            <p className="text-sm text-gray-500">Các tập đoàn công nghệ hàng đầu thế giới</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : brandList.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">Chưa có thương hiệu.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {brandList.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-center h-16 hover:shadow-sm transition"
                >
                  {brand.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-8 max-w-full object-contain grayscale hover:grayscale-0 transition"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="font-bold text-gray-600 text-sm">{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}