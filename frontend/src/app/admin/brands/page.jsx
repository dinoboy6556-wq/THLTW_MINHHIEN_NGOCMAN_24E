"use client";

import { useState, useEffect, useCallback } from "react";
import brandService from "@/services/brandService";
import { getErrorMessage } from "@/lib/axios";
import BrandLogo from "@/components/BrandLogo";

export default function AdminBrandPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Form States (Thêm / Sửa tại chỗ)
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(1);

  // States Tìm kiếm, Lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Hàm bóc tách mảng an toàn theo mọi kiểu JSON Laravel
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (Array.isArray(resData.brands)) return resData.brands;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // 1. TẢI DANH SÁCH BẰNG AXIOS SERVICE
  // 1. TẢI DANH SÁCH THƯƠNG HIỆU
  const loadBrands = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await brandService.getAll();
      const extractedList = extractArray(res.data);
      setBrands(extractedList);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error("Lỗi API Thương hiệu:", errorMsg);
      setApiError(errorMsg);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadBrands();
    });
  }, [loadBrands]);

  const resetForm = () => {
    setName("");
    setLogo("");
    setDescription("");
    setStatus(1);
    setEditingId(null);
  };

  const handleEditClick = (brand) => {
    setEditingId(brand.id);
    setName(brand.name || "");
    setLogo(brand.logo || "");
    setDescription(brand.description || "");
    setStatus(brand.status !== undefined ? Number(brand.status) : 1);
  };

  // 2. THÊM / SỬA BẰNG AXIOS SERVICE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      logo,
      description,
      status: Number(status),
    };

    try {
      if (editingId) {
        await brandService.update(editingId, payload);
        alert("Cập nhật thương hiệu thành công!");
      } else {
        await brandService.create(payload);
        alert("Thêm thương hiệu mới thành công!");
      }
      resetForm();
      loadBrands();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // 3. XÓA BẰNG AXIOS SERVICE
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;

    try {
      await brandService.remove(id);
      alert("Đã xóa thương hiệu thành công!");
      if (editingId === id) resetForm();
      loadBrands();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // 4. BỘ LỌC TÌM KIẾM VÀ PHÂN TRANG
  const brandList = Array.isArray(brands) ? brands : [];
  const filteredBrands = brandList.filter((brand) => {
    const matchesSearch =
      brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand.description &&
        brand.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const brandStatus = brand.status !== undefined ? String(brand.status) : "1";
    const matchesStatus =
      statusFilter === "all" || brandStatus === String(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Quản Lý Thương Hiệu
      </h2>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between items-center">
          <span>
            ⚠️ <b>Lỗi kết nối API:</b> {apiError}
          </span>
          <button
            onClick={loadBrands}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= FORM THÊM / SỬA TẠI CHỖ ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? "Cập Nhật Thương Hiệu" : "Thêm Thương Hiệu Mới"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-500 hover:underline"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thương hiệu *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Apple, Samsung, ASUS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đường dẫn Logo (URL)
              </label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://via.placeholder.com/150x50.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Mô tả thương hiệu..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
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
                  editingId
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {editingId ? "Lưu Thay Đổi" : "Thêm Thương Hiệu"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= BẢNG DANH SÁCH + TÌM KIẾM + PHÂN TRANG ================= */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
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
                <option value="1">Đang hiển thị</option>
                <option value="0">Đang ẩn</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Đang tải thương hiệu...
              </div>
            ) : paginatedBrands.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Không tìm thấy thương hiệu phù hợp.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-4">ID</th>
                    <th className="p-4">Logo</th>
                    <th className="p-4">Tên thương hiệu</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {paginatedBrands.map((brand) => {
                    const isVisible =
                      brand.status === undefined ||
                      brand.status == 1 ||
                      brand.status === true ||
                      brand.status === "1";

                    return (
                      <tr
                        key={brand.id}
                        className={`hover:bg-gray-50 transition ${
                          editingId === brand.id ? "bg-amber-50/50" : ""
                        }`}
                      >
                        <td className="p-4 font-bold text-gray-700">
                          {brand.id}
                        </td>
                        <td className="p-4">
                          <BrandLogo
                            name={brand.name}
                            src={brand.logo}
                            className="flex h-8 w-16 items-center justify-center rounded border border-gray-100 bg-white"
                            imageClassName="h-8 w-16 rounded object-contain"
                            fallbackClassName="truncate px-1 text-center text-[10px] font-bold text-indigo-700"
                          />
                        </td>
                        <td className="p-4 text-gray-800 font-medium">
                          <div>{brand.name}</div>
                          {brand.description && (
                            <div className="text-xs text-gray-400 font-normal line-clamp-1">
                              {brand.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-xs">
                          {brand.slug}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isVisible
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isVisible ? "Hiển thị" : "Ẩn"}
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
                  {Math.min(startIndex + itemsPerPage, filteredBrands.length)} /{" "}
                  {filteredBrands.length} thương hiệu
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
