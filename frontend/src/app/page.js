"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";
import { getErrorMessage } from "@/lib/axios";
import ArticleCard from "@/components/ArticleCard";
import { articles } from "@/data/articles";

// Hàm tự động gán Icon Emoji sinh động theo tên Danh Mục
const getCategoryIcon = (catName = "") => {
  const name = catName.toLowerCase();
  if (
    name.includes("điện thoại") ||
    name.includes("phone") ||
    name.includes("smartphone") ||
    name.includes("tablet")
  )
    return "📱";
  if (name.includes("laptop") || name.includes("máy tính")) return "💻";
  if (name.includes("phụ kiện")) return "🎧";
  if (name.includes("đồng hồ") || name.includes("watch")) return "⌚";
  if (name.includes("màn hình") || name.includes("gaming")) return "🖥️";
  return "📦";
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm bóc tách mảng an toàn theo cấu trúc JSON Laravel API ({ success, message, data: [...] })
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // Tải dữ liệu trang chủ
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

  // Lọc sản phẩm mở bán
  const activeProducts = productList.filter(
    (p) =>
      p.status === undefined ||
      p.status == 1 ||
      p.status === true ||
      p.status === null,
  );

  // 1. Lọc theo từ khóa tìm kiếm
  const searchResults = activeProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  // 2. Danh sách Sản Phẩm Sale (Đọc trường sale_price từ API)
  const saleProducts = activeProducts.filter((p) => {
    const salePrice = p.sale_price ?? p.promo_price;
    return (
      salePrice && Number(salePrice) > 0 && Number(salePrice) < Number(p.price)
    );
  });

  // 3. Danh sách Sản Phẩm Mới (Sắp xếp theo ID giảm dần)
  const newProducts = [...activeProducts]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 8);

  // Hàm hiển thị Thẻ Sản Phẩm
  const renderProductCard = (product, isSale = false) => {
    const salePrice = product.sale_price ?? product.promo_price;
    const hasDiscount =
      salePrice &&
      Number(salePrice) > 0 &&
      Number(salePrice) < Number(product.price);

    const discountPercent = hasDiscount
      ? Math.round(
          ((Number(product.price) - Number(salePrice)) /
            Number(product.price)) *
            100,
        )
      : 0;

    return (
      <div
        key={product.id}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
      >
        {/* Badge Giảm giá */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
              🔥 -{discountPercent}%
            </span>
          )}
          {!discountPercent && isSale && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              HOT SALE
            </span>
          )}
        </div>

       {/* Khung Ảnh Sản Phẩm */}
        <div className="relative p-4 bg-gray-50/80 flex items-center justify-center h-52 overflow-hidden">
          {(() => {
            const rawImg = product.thumbnail || product.image || product.photo || product.img || product.image_url;
            
            if (!rawImg) {
              return <div className="text-gray-400 text-xs font-medium">Chưa có ảnh</div>;
            }

            // Xử lý cắt bỏ đường dẫn tuyệt đối trên máy tính nếu có (ví dụ: F:/Code/.../iphone16.jpg -> iphone16.jpg)
            let imageName = rawImg;
            if (rawImg.includes(":") || rawImg.includes("\\") || rawImg.includes("/")) {
              const parts = rawImg.split(/[\/\\]/);
              imageName = parts[parts.length - 1];
            }

            const finalImageUrl = rawImg.startsWith("http")
              ? rawImg
              : `http://127.0.0.1:8000/storage/${imageName}`;

            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={finalImageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            );
          })()}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-indigo-600 transition">
              <Link href={`/products/${product.slug || product.id}`}>
                {product.name}
              </Link>
            </h3>
            {product.description && (
              <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                {product.description}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-red-600 font-bold text-base">
                    {Number(salePrice).toLocaleString("vi-VN")} đ
                  </span>
                  <span className="text-gray-400 text-xs line-through">
                    {Number(product.price).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              ) : (
                <span className="text-gray-900 font-bold text-base">
                  {Number(product.price || 0).toLocaleString("vi-VN")} đ
                </span>
              )}
            </div>

            <Link
              href={`/products/${product.slug || product.id}`}
              className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
            >
              Xem ngay
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-12 pb-16">
      {/* 1. HERO BANNER & THANH TÌM KIẾM TẬP TRUNG */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-6 sm:px-12 rounded-b-3xl shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8 relative z-10">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-500/30 backdrop-blur-md">
            ✨ Hệ Thống Bán Lẻ Công Nghệ Hàng Đầu 2026
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight max-w-4xl">
            Tìm Kiếm & Trải Nghiệm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">
              Công Nghệ Đỉnh Cao
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Smartphone, Laptop, Tablet chính hãng với ngàn ưu đãi cực sốc. Bảo
            hành 1 đổi 1 uy tín toàn quốc.
          </p>

          {/* THANH TÌM KIẾM TRỰC TIẾP */}
          <div className="w-full max-w-2xl bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-2">
            <div className="pl-3 text-gray-400 text-xl">🔍</div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên điện thoại, laptop, tai nghe bạn muốn tìm..."
              className="w-full bg-transparent text-white placeholder-gray-300 text-sm sm:text-base px-2 py-2 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-white px-2 text-sm font-bold"
              >
                ✕
              </button>
            )}
            <Link
              href="/products"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition shrink-0 shadow-lg shadow-indigo-600/40"
            >
              Tất cả SP
            </Link>
          </div>

          {/* Cam kết dịch vụ nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-left">
              <span className="text-2xl">🚀</span>
              <h3 className="font-bold text-white text-xs sm:text-sm mt-1">
                Giao Nhanh 2H
              </h3>
              <p className="text-[11px] text-gray-400">
                Miễn phí ship từ 1 triệu
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-left">
              <span className="text-2xl">🛡️</span>
              <h3 className="font-bold text-white text-xs sm:text-sm mt-1">
                Chính Hãng 100%
              </h3>
              <p className="text-[11px] text-gray-400">Bảo hành ủy quyền</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-left">
              <span className="text-2xl">🔄</span>
              <h3 className="font-bold text-white text-xs sm:text-sm mt-1">
                1 Đổi 1 Trong 30 Ngày
              </h3>
              <p className="text-[11px] text-gray-400">Lỗi là đổi mới</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-left">
              <span className="text-2xl">💳</span>
              <h3 className="font-bold text-white text-xs sm:text-sm mt-1">
                Trả Góp 0%
              </h3>
              <p className="text-[11px] text-gray-400">Thủ tục nhanh chóng</p>
            </div>
          </div>
        </div>
      </section>

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-12">
        {/* KHU VỰC KẾT QUẢ TÌM KIẾM */}
        {searchTerm.trim() !== "" ? (
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Kết Quả Tìm Kiếm Cho: &quot;
                  <span className="text-indigo-600">{searchTerm}</span>&quot;
                </h2>
                <p className="text-sm text-gray-500">
                  Tìm thấy {searchResults.length} sản phẩm phù hợp
                </p>
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Xóa tìm kiếm ✕
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
                Không tìm thấy sản phẩm nào khớp với từ khóa của bạn.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {searchResults.map((p) => renderProductCard(p))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* 2. DANH MỤC NỔI BẬT */}
            <section id="featured-categories" className="flex flex-col gap-6">
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Danh Mục Nổi Bật
                  </h2>
                  <p className="text-sm text-gray-500">
                    Khám phá theo nhu cầu sản phẩm
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200 animate-pulse rounded-2xl"
                    ></div>
                  ))}
                </div>
              ) : categoryList.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Chưa có danh mục nào.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {categoryList.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category_id=${cat.id}`}
                      className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition text-center flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                        {getCategoryIcon(cat.name)}
                      </div>
                      <span className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 3. SẢN PHẨM KHUYẾN MÃI (HOT SALE) */}
            {saleProducts.length > 0 && (
              <section className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-red-500/10 p-6 rounded-3xl border border-red-100 flex flex-col gap-6">
                <div className="flex justify-between items-end border-b border-red-200/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl animate-bounce">🔥</span>
                    <div>
                      <h2 className="text-2xl font-extrabold text-red-600 tracking-tight">
                        Sản Phẩm Sale Khuyến Mãi
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        Cơ hội mua sắm công nghệ với giá siêu hời (
                        {saleProducts.length} deal hot)
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/products"
                    className="text-red-600 hover:underline text-xs font-bold"
                  >
                    Xem tất cả deal &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {saleProducts
                    .slice(0, 8)
                    .map((p) => renderProductCard(p, true))}
                </div>
              </section>
            )}

            {/* 4. SẢN PHẨM MỚI NHẤT */}
            <section className="flex flex-col gap-6">
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Sản Phẩm Mới Nhất
                  </h2>
                  <p className="text-sm text-gray-500">
                    Thiết bị công nghệ vừa cập bến cửa hàng
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-indigo-600 hover:underline text-sm font-semibold"
                >
                  Xem tất cả &rarr;
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-72 bg-gray-200 animate-pulse rounded-2xl"
                    ></div>
                  ))}
                </div>
              ) : newProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border text-gray-500">
                  Chưa có sản phẩm mới nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {newProducts.map((p) => renderProductCard(p))}
                </div>
              )}
            </section>

            {/* 5. THƯƠNG HIỆU ĐỒNG HÀNH */}
            <section className="flex flex-col gap-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Thương Hiệu Đồng Hành
                </h2>
                <p className="text-sm text-gray-500">
                  Các thương hiệu công nghệ hàng đầu
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : brandList.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Chưa có thương hiệu.
                </div>
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
                        <span className="font-bold text-gray-600 text-sm">
                          {brand.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex items-end justify-between border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Góc Công Nghệ
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tin tức và kinh nghiệm chọn thiết bị mới nhất
                  </p>
                </div>
                <Link
                  href="/posts"
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  Xem tất cả bài viết →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 3).map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
