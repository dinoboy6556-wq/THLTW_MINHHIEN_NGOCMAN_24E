"use client";

import { useCallback, useEffect, useState } from "react";
import menuService from "@/services/menuService";
import { getErrorMessage } from "@/lib/axios";

const emptyForm = {
  label: "",
  url: "",
  sort_order: 1,
  status: true,
  open_new_tab: false,
};

export default function AdminMenusPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await menuService.getAdminAll();
      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadItems);
  }, [loadItems]);

  const resetForm = () => {
    setForm({ ...emptyForm, sort_order: items.length + 1 });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      label: item.label || "",
      url: item.url || "",
      sort_order: Number(item.sort_order || 0),
      status: Boolean(item.status),
      open_new_tab: Boolean(item.open_new_tab),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await menuService.update(editingId, form);
      } else {
        await menuService.create(form);
      }
      resetForm();
      await loadItems();
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      setError(
        validationErrors
          ? Object.values(validationErrors).flat()[0]
          : getErrorMessage(requestError),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Chuyển mục “${item.label}” vào thùng rác?`)) return;
    try {
      await menuService.remove(item.id);
      if (editingId === item.id) resetForm();
      await loadItems();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const sortedItems = [...items].sort(
    (first, second) => Number(first.sort_order) - Number(second.sort_order) || first.id - second.id,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Menu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thêm liên kết, sắp xếp thứ tự và bật/tắt các mục trên thanh điều hướng cửa hàng.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={loadItems} className="font-semibold underline">Tải lại</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Sửa mục menu" : "Thêm mục menu"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm font-medium text-slate-500 hover:text-slate-800">Hủy sửa</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Tên hiển thị</span>
              <input required maxLength={100} value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Ví dụ: Khuyến mãi" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Đường dẫn</span>
              <input required maxLength={2048} value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="/products hoặc https://..." />
              <span className="mt-1 block text-xs text-slate-500">Dùng đường dẫn nội bộ bắt đầu bằng / hoặc URL http(s).</span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Thứ tự hiển thị</span>
              <input type="number" required min={0} max={65535} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.status} onChange={(event) => setForm({ ...form, status: event.target.checked })} className="h-4 w-4 accent-indigo-600" />
              Hiển thị trên cửa hàng
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.open_new_tab} onChange={(event) => setForm({ ...form, open_new_tab: event.target.checked })} className="h-4 w-4 accent-indigo-600" />
              Mở liên kết ở tab mới
            </label>

            <button type="submit" disabled={saving} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
              {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm vào menu"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Các mục menu</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{items.length} mục</span>
          </div>
          {loading ? (
            <p className="p-10 text-center text-sm text-slate-500">Đang tải menu...</p>
          ) : sortedItems.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-500">Chưa có mục menu.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">#{item.sort_order}</span>
                      <h3 className="font-semibold text-slate-900">{item.label}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.status ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {item.status ? "Đang hiện" : "Đang ẩn"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{item.url}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => handleEdit(item)} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Sửa</button>
                    <button type="button" onClick={() => handleDelete(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">Thùng rác</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
