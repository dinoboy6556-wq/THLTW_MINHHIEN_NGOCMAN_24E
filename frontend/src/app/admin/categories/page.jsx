"use client";

import { useState, useEffect } from "react";
import categoryService from "@/services/categoryService";
import { getErrorMessage } from "@/lib/axios";

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States (Thêm/Sửa trên cùng 1 trang)
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(1);

  // States Tìm kiếm, Lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. TẢI DANH SÁCH BẰNG AXIOS SERVICE
  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const data = res.data;

      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray(data.data)) setCategories(data.data);
      else setCategories([]);
    } catch (err) {
      console.error(getErrorMessage(err));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      loadCategories();
    });
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus(1);
    setEditingId(null);
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setName(cat.name || "");
    setDescription(cat.description || "");
    setStatus(Number(cat.status ?? 1));
  };

  // 2. THÊM / SỬA BẰNG AXIOS SERVICE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, description, status: Number(status) };

    try {
      if (editingId) {
        await categoryService.update(editingId, payload);
        alert("Cập nhật danh mục thành công!");
      } else {
        await categoryService.create(payload);
        alert("Thêm danh mục mới thành công!");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // 3. XÓA BẰNG AXIOS SERVICE
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      await categoryService.remove(id);
      alert("Đã xóa thành công!");
      if (editingId === id) resetForm();
      loadCategories();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // 4. BỘ LỌC TÌM KIẾM VÀ PHÂN TRANG (GIỮ TỪ BÀI CỦ)
  const categoryList = Array.isArray(categories) ? categories : [];
  const filteredCategories = categoryList.filter((cat) => {
    const matchesSearch =
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description &&
        cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || String(cat.status) === String(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Quản Lý Danh Mục (Axios)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= FORM THÊM / SỬA TẠI CHỖ ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
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
                Tên danh mục *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Màn Hình"
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
                placeholder="Mô tả danh mục..."
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
                {editingId ? "Lưu Thay Đổi" : "Thêm Danh Mục"}
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
                placeholder="Tìm kiếm danh mục..."
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
                Đang tải danh mục...
              </div>
            ) : paginatedCategories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Không tìm thấy danh mục phù hợp.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-4">ID</th>
                    <th className="p-4">Tên danh mục</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {paginatedCategories.map((cat) => {
                    const isVisible =
                      cat.status == 1 ||
                      cat.status === true ||
                      cat.status === "1";

                    return (
                      <tr
                        key={cat.id}
                        className={`hover:bg-gray-50 transition ${
                          editingId === cat.id ? "bg-amber-50/50" : ""
                        }`}
                      >
                        <td className="p-4 font-bold text-gray-700">
                          {cat.id}
                        </td>
                        <td className="p-4 text-gray-800 font-medium">
                          <div>{cat.name}</div>
                          {cat.description && (
                            <div className="text-xs text-gray-400 font-normal line-clamp-1">
                              {cat.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-xs">
                          {cat.slug}
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
                              onClick={() => handleEditClick(cat)}
                              className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
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
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredCategories.length,
                  )}{" "}
                  / {filteredCategories.length} danh mục
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
