"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/axios";
import postService from "@/services/postService";

const emptyForm = {
  title: "",
  category: "",
  excerpt: "",
  content: "",
  cover_image: "",
  status: 0,
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await postService.getAdminAll({ per_page: 100 });
      setPosts(response.data?.data?.data ?? []);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Lỗi tải danh sách bài viết:", message);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadPosts);
  }, [loadPosts]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setCoverImageFile(null);
    setCoverImagePreview("");
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setCoverImageFile(null);
    setCoverImagePreview(post.cover_image || "");
    setForm({
      title: post.title || "",
      category: post.category || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      status: Number(post.status),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "cover_image" && value !== null && value !== undefined) {
          payload.append(key, String(value));
        }
      });
      if (coverImageFile) {
        payload.append("cover_image_file", coverImageFile);
      } else if (!editingId && form.cover_image) {
        payload.append("cover_image", form.cover_image);
      }

      if (editingId) {
        payload.append("_method", "PUT");
        await postService.update(editingId, payload);
        alert("Cập nhật bài viết thành công!");
      } else {
        await postService.create(payload);
        alert("Thêm bài viết thành công!");
      }

      resetForm();
      await loadPosts();
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`)) {
      return;
    }

    try {
      await postService.remove(post.id);
      if (editingId === post.id) {
        resetForm();
      }
      await loadPosts();
      alert("Đã xóa bài viết thành công!");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      post.title?.toLowerCase().includes(search) ||
      post.category?.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || String(post.status) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý bài viết
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Soạn, chỉnh sửa và xuất bản bài viết trên cửa hàng.
          </p>
        </div>
        <a
          href="/posts"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
        >
          Xem trang bài viết
        </a>
      </div>

      {apiError && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>Không thể tải bài viết: {apiError}</span>
          <button
            onClick={loadPosts}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              {editingId ? "Cập nhật bài viết" : "Viết bài mới"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                Hủy sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Tiêu đề *
              <input
                required
                maxLength={255}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập tiêu đề bài viết"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Chuyên mục *
              <input
                required
                maxLength={100}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Mẹo công nghệ"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Tóm tắt *
              <textarea
                required
                maxLength={1000}
                rows={3}
                value={form.excerpt}
                onChange={(event) =>
                  setForm({ ...form, excerpt: event.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mô tả ngắn hiển thị ở danh sách bài viết"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Nội dung * (xuống dòng để tách đoạn)
              <textarea
                required
                rows={9}
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal leading-6 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập nội dung bài viết..."
              />
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ảnh bìa từ máy
              </label>
              <input
                key={editingId || "new-post"}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setCoverImageFile(file);
                  setCoverImagePreview(file ? URL.createObjectURL(file) : "");
                }}
                className="mt-1 w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG hoặc WebP, tối đa 5 MB.
              </p>
              {coverImagePreview && (
                <img
                  src={coverImagePreview}
                  alt="Xem trước ảnh bìa"
                  className="mt-3 h-28 w-full rounded-lg border border-gray-200 bg-gray-50 object-cover"
                />
              )}
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Trạng thái
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: Number(event.target.value) })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Bản nháp</option>
                <option value={1}>Xuất bản</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {saving
                ? "Đang lưu..."
                : editingId
                  ? "Lưu thay đổi"
                  : "Tạo bài viết"}
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-4 xl:col-span-2">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm tiêu đề hoặc chuyên mục..."
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Đã xuất bản</option>
              <option value="0">Bản nháp</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Đang tải bài viết...
              </p>
            ) : filteredPosts.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Chưa có bài viết phù hợp.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4">Bài viết</th>
                      <th className="p-4">Chuyên mục</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPosts.map((post) => {
                      const isPublished = Number(post.status) === 1;

                      return (
                        <tr
                          key={post.id}
                          className={`transition hover:bg-gray-50 ${
                            editingId === post.id ? "bg-amber-50/50" : ""
                          }`}
                        >
                          <td className="max-w-xs p-4">
                            <p className="line-clamp-2 font-semibold text-gray-800">
                              {post.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              /posts/{post.slug}
                            </p>
                          </td>
                          <td className="p-4 text-gray-600">{post.category}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isPublished
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isPublished ? "Đã xuất bản" : "Bản nháp"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(post)}
                                className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(post)}
                                className="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
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
              </div>
            )}
          </div>
          <p className="text-right text-xs text-gray-500">
            {filteredPosts.length} bài viết
          </p>
        </section>
      </div>
    </div>
  );
}
