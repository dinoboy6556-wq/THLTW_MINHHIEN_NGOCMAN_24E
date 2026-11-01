"use client";

import { useState, useEffect, useCallback } from "react";
import productService from "@/services/productService";
import ProductForm from "@/components/admin/ProductForm";
import { getErrorMessage } from "@/lib/axios";

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // States Tìm kiếm, Lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Hàm bóc tách Mảng an toàn
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (Array.isArray(resData.products)) return resData.products;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // 1. TẢI DANH SÁCH SẢN PHẨM
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await productService.getAll();
      const extractedList = extractArray(res.data);
      setProducts(extractedList);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error("Lỗi API Sản phẩm:", errorMsg);
      setApiError(errorMsg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadProducts();
    });
  }, [loadProducts]);

  const handleDelete = async (id) => {
    if (!confirm("Chuyển sản phẩm này vào thùng rác?")) return;

    try {
      await productService.remove(id);
      alert("Đã chuyển sản phẩm vào thùng rác.");
      loadProducts();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  // 2. LỌC VÀ PHÂN TRANG
  const productList = Array.isArray(products) ? products : [];

  const filteredProducts = productList.filter((prod) => {
    const matchesSearch = prod.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const prodStatus = prod.status !== undefined ? String(prod.status) : "1";
    const matchesStatus =
      statusFilter === "all" || prodStatus === String(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Sản Phẩm</h2>
          <p className="text-sm text-gray-500">
            Danh sách tất cả sản phẩm trong kho hàng
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(!showForm);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-sm"
        >
          {showForm ? "Đóng Form" : "+ Thêm Sản Phẩm Mới"}
        </button>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between items-center">
          <span>
            ⚠️ <b>Lỗi kết nối API:</b> {apiError}
          </span>
          <button
            onClick={loadProducts}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM THÊM / SỬA */}
        {showForm && (
          <div className="lg:col-span-1">
            <ProductForm
              key={editingProduct?.id ?? "new-product"}
              editingProduct={editingProduct}
              onSuccess={handleSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}

        {/* BẢNG DANH SÁCH SẢN PHẨM */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="flex flex-col gap-4">
            {/* Thanh Tìm Kiếm & Lọc */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
                  🔍
                </span>
              </div>

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
                  <option value="1">Mở bán (Hiển thị)</option>
                  <option value="0">Đang ẩn</option>
                </select>
              </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  Đang tải danh sách sản phẩm...
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Không tìm thấy sản phẩm nào phù hợp.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                      <th className="p-4">ID</th>
                      <th className="p-4">Ảnh</th>
                      <th className="p-4">Tên Sản Phẩm</th>
                      <th className="p-4">Giá bán</th>
                      <th className="p-4 text-center">Tồn kho</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {paginatedProducts.map((prod) => {
                      const isVisible =
                        prod.status === undefined ||
                        prod.status == 1 ||
                        prod.status === true ||
                        prod.status === "1";

                      return (
                        <tr
                          key={prod.id}
                          className={`hover:bg-gray-50 transition ${
                            editingProduct?.id === prod.id
                              ? "bg-amber-50/50"
                              : ""
                          }`}
                        >
                          <td className="p-4 font-bold text-gray-700">
                            {prod.id}
                          </td>
                          <td className="p-4">
                            {prod.thumbnail ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={prod.thumbnail}
                                alt={prod.name}
                                className="h-10 w-10 object-cover rounded-lg border border-gray-100 bg-white"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                                No img
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-gray-800 font-medium">
                            <div>{prod.name}</div>
                            <div className="text-xs text-gray-400 font-normal">
                              Slug: {prod.slug}
                            </div>
                          </td>
                          <td className="p-4 font-medium">
                            {prod.promo_price ? (
                              <div>
                                <span className="text-red-600 font-bold">
                                  {Number(prod.promo_price).toLocaleString(
                                    "vi-VN",
                                  )}{" "}
                                  đ
                                </span>
                                <div className="text-xs text-gray-400 line-through">
                                  {Number(prod.price).toLocaleString("vi-VN")} đ
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-800 font-bold">
                                {Number(prod.price).toLocaleString("vi-VN")} đ
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center font-bold text-gray-700">
                            {prod.stock}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isVisible
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isVisible ? "Mở bán" : "Ẩn"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditClick(prod)}
                                className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                title="Chuyển vào thùng rác"
                                aria-label="Chuyển sản phẩm vào thùng rác"
                                onClick={() => handleDelete(prod.id)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <span className="text-xs text-gray-500">
                    Hiển thị {startIndex + 1} -{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredProducts.length,
                    )}{" "}
                    / {filteredProducts.length} sản phẩm
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="px-3 py-1 border rounded-md text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 bg-white"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                            currentPage === page
                              ? "bg-indigo-600 text-white"
                              : "bg-white border text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev - 1 + 2)}
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
    </div>
  );
}
