"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";
import { getErrorMessage } from "@/lib/axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // States Bộ Lọc & Sắp Xếp
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    queueMicrotask(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const categoryId = searchParams.get("category_id");
      const brandId = searchParams.get("brand_id");
      if (categoryId) setSelectedCategory(categoryId);
      if (brandId) setSelectedBrand(brandId);
    });
  }, []);

  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Hàm bóc tách mảng an toàn
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // Tải dữ liệu từ API
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [firstProductPage, resCat, resBrand] = await Promise.all([
          productService.getAll({ per_page: 100 }),
          categoryService.getAll(),
          brandService.getAll(),
        ]);

        const productPages = [extractArray(firstProductPage.data)];
        const lastProductPage = Number(
          firstProductPage.data?.pagination?.last_page ??
            firstProductPage.data?.meta?.last_page ??
            firstProductPage.data?.data?.last_page ??
            1,
        );

        if (lastProductPage > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: lastProductPage - 1 }, (_, index) =>
              productService.getAll({ per_page: 100, page: index + 2 }),
            ),
          );
          productPages.push(...remainingPages.map((page) => extractArray(page.data)));
        }

        if (isMounted) {
          setProducts(productPages.flat());
          setCategories(extractArray(resCat.data));
          setBrands(extractArray(resBrand.data));
        }
      } catch (err) {
        console.error("Lỗi tải danh sách sản phẩm:", getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(() => {
      fetchData();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc sản phẩm mở bán
  const productList = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter(
      (p) =>
        p.status === undefined ||
        p.status == 1 ||
        p.status === true ||
        p.status === null,
    );
  }, [products]);

  // Xử lý Lọc & Sắp xếp dữ liệu (Memoized)
  const filteredProducts = useMemo(() => {
    return productList
      .filter((product) => {
        // 1. Lọc theo từ khóa tìm kiếm (Tên / Mô tả)
        const matchSearch =
          !searchTerm.trim() ||
          product.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase().trim()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase().trim());

        // 2. Lọc theo Danh mục
        const productCatId = product.category_id || product.category?.id;
        const matchCategory =
          selectedCategory === "all" ||
          String(productCatId) === String(selectedCategory);

        // 3. Lọc theo Thương hiệu
        const productBrandId = product.brand_id || product.brand?.id;
        const matchBrand =
          selectedBrand === "all" ||
          String(productBrandId) === String(selectedBrand);

        // 4. Lọc theo Khoảng giá
        const currentPrice = Number(
          product.sale_price ?? product.promo_price ?? product.price ?? 0,
        );
        let matchPrice = true;
        if (priceRange === "under-10m") matchPrice = currentPrice < 10000000;
        else if (priceRange === "10m-20m")
          matchPrice = currentPrice >= 10000000 && currentPrice <= 20000000;
        else if (priceRange === "20m-30m")
          matchPrice = currentPrice >= 20000000 && currentPrice <= 30000000;
        else if (priceRange === "above-30m")
          matchPrice = currentPrice > 30000000;

        return matchSearch && matchCategory && matchBrand && matchPrice;
      })
      .sort((a, b) => {
        const priceA = Number(a.sale_price ?? a.promo_price ?? a.price ?? 0);
        const priceB = Number(b.sale_price ?? b.promo_price ?? b.price ?? 0);

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "discount") {
          const discountA = a.price ? Number(a.price) - priceA : 0;
          const discountB = b.price ? Number(b.price) - priceB : 0;
          return discountB - discountA;
        }
        return (b.id || 0) - (a.id || 0);
      });
  }, [
    productList,
    searchTerm,
    selectedCategory,
    selectedBrand,
    priceRange,
    sortBy,
  ]);

  // Phân trang an toàn
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Xóa toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setPriceRange("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        {/* HEADER TRANG SẢN PHẨM */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Cửa Hàng Sản Phẩm
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Khám phá các thiết bị công nghệ chính hãng với mức giá ưu đãi nhất
            </p>
          </div>

          {/* Thanh tìm kiếm nhanh */}
          <div className="w-full md:w-80 bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md flex items-center gap-2">
            <span className="pl-3 text-gray-300">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm tên sản phẩm..."
              className="w-full bg-transparent text-white placeholder-gray-300 text-sm focus:outline-none px-1"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="text-gray-300 hover:text-white px-2 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* THANH BỘ LỌC & SẮP XẾP */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {/* 1. Danh mục */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">📁 Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* 2. Thương hiệu */}
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">🏷️ Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            {/* 3. Khoảng giá */}
            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">💵 Tất cả mức giá</option>
              <option value="under-10m">Dưới 10 triệu</option>
              <option value="10m-20m">10 - 20 triệu</option>
              <option value="20m-30m">20 - 30 triệu</option>
              <option value="above-30m">Trên 30 triệu</option>
            </select>

            {/* Nút đặt lại bộ lọc */}
            <button
              onClick={handleResetFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl px-3 py-2.5 transition flex items-center justify-center gap-1"
            >
              🔄 Đặt lại
            </button>
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0">
            <span className="text-xs text-gray-500 font-medium">
              Tìm thấy{" "}
              <b className="text-gray-800">{filteredProducts.length}</b> sản
              phẩm
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-indigo-50/60 border border-indigo-100 text-indigo-900 font-semibold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="latest">⚡ Mới nhất</option>
                <option value="price-asc">📈 Giá thấp → cao</option>
                <option value="price-desc">📉 Giá cao → thấp</option>
                <option value="discount">🔥 Giảm giá nhiều nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 animate-pulse rounded-2xl"
              ></div>
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3">
            <span className="text-5xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-800">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc danh
              mục/thương hiệu/khoảng giá.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => {
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
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                        🔥 -{discountPercent}%
                      </span>
                    </div>
                  )}

                  {/* Khung Ảnh Sản Phẩm */}
                  <div className="relative p-4 bg-gray-50/80 flex items-center justify-center h-52 overflow-hidden">
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
                      <div className="text-gray-400 text-xs font-medium">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        {product.category?.name && (
                          <span>{product.category.name}</span>
                        )}
                        {product.category?.name && product.brand?.name && (
                          <span>•</span>
                        )}
                        {product.brand?.name && (
                          <span className="text-indigo-600">
                            {product.brand.name}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-indigo-600 transition mt-1">
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
                            {Number(product.price || 0).toLocaleString("vi-VN")}{" "}
                            đ
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PHÂN TRANG */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <span className="text-xs text-gray-500">
              Hiển thị <b>{startIndex + 1}</b> -{" "}
              <b>
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
              </b>{" "}
              trong tổng số <b>{filteredProducts.length}</b> sản phẩm
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={activePage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3.5 py-1.5 border rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition"
              >
                « Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      activePage === page
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-white border text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3.5 py-1.5 border rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition"
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
