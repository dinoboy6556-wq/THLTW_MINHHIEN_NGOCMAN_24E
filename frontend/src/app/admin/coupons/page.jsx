"use client";

import { useCallback, useEffect, useState } from "react";
import couponService from "@/services/couponService";
import { getErrorMessage } from "@/lib/axios";

const emptyForm = { code: "", discount_type: "percent", discount_value: "", minimum_order_amount: "0", maximum_discount_amount: "", usage_limit: "", starts_at: "", ends_at: "", is_active: true };
const localDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : "";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCoupons = useCallback(async () => {
    setError("");
    try {
      const response = await couponService.getAdminAll({ per_page: 100 });
      setCoupons(response.data?.data?.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, []);

  useEffect(() => { queueMicrotask(loadCoupons); }, [loadCoupons]);

  const saveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discount_value: Number(form.discount_value),
      minimum_order_amount: Number(form.minimum_order_amount || 0),
      maximum_discount_amount: form.maximum_discount_amount ? Number(form.maximum_discount_amount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };
    try {
      if (editingId) await couponService.update(editingId, payload);
      else await couponService.create(payload);
      setForm(emptyForm);
      setEditingId(null);
      await loadCoupons();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      minimum_order_amount: String(coupon.minimum_order_amount || 0),
      maximum_discount_amount: coupon.maximum_discount_amount ? String(coupon.maximum_discount_amount) : "",
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      starts_at: localDate(coupon.starts_at),
      ends_at: localDate(coupon.ends_at),
      is_active: Boolean(coupon.is_active),
    });
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Xóa/vô hiệu hóa mã ${coupon.code}?`)) return;
    try {
      await couponService.remove(coupon.id);
      await loadCoupons();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const fieldClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
  return (
    <div className="flex flex-col gap-6">
      <header><h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1><p className="mt-1 text-sm text-gray-500">Tạo mã theo phần trăm hoặc số tiền, đặt thời hạn và giới hạn lượt dùng.</p></header>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={saveCoupon} className="grid gap-4 rounded-xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">Mã<input required maxLength={40} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={`${fieldClass} mt-1 uppercase`} placeholder="WELCOME10" /></label>
        <label className="text-sm">Kiểu giảm<select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={`${fieldClass} mt-1`}><option value="percent">Phần trăm (%)</option><option value="fixed">Số tiền (đ)</option></select></label>
        <label className="text-sm">Giá trị giảm<input required type="number" min="0.01" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="text-sm">Đơn tối thiểu (đ)<input type="number" min="0" value={form.minimum_order_amount} onChange={(e) => setForm({ ...form, minimum_order_amount: e.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="text-sm">Giảm tối đa (đ)<input type="number" min="0" value={form.maximum_discount_amount} onChange={(e) => setForm({ ...form, maximum_discount_amount: e.target.value })} className={`${fieldClass} mt-1`} placeholder="Không giới hạn" /></label>
        <label className="text-sm">Giới hạn lượt<input type="number" min="1" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className={`${fieldClass} mt-1`} placeholder="Không giới hạn" /></label>
        <label className="text-sm">Bắt đầu<input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="text-sm">Kết thúc<input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className={`${fieldClass} mt-1`} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Đang hoạt động</label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Đang lưu…" : editingId ? "Lưu thay đổi" : "Tạo mã"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border px-4 py-2 text-sm">Hủy sửa</button>}</div>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Mã</th><th className="p-3">Giảm</th><th className="p-3">Đã dùng</th><th className="p-3">Thời hạn</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead><tbody className="divide-y">{coupons.map((coupon) => <tr key={coupon.id}><td className="p-3 font-bold">{coupon.code}</td><td className="p-3">{coupon.discount_type === "percent" ? `${coupon.discount_value}%` : `${Number(coupon.discount_value).toLocaleString("vi-VN")} đ`}</td><td className="p-3">{coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / ∞"}</td><td className="p-3 text-xs">{coupon.starts_at || "Không giới hạn"}<br />{coupon.ends_at || ""}</td><td className="p-3">{coupon.is_active ? "Đang bật" : "Đã tắt"}</td><td className="p-3"><div className="flex gap-2"><button onClick={() => editCoupon(coupon)} className="text-indigo-600">Sửa</button><button onClick={() => deleteCoupon(coupon)} className="text-red-600">Xóa</button></div></td></tr>)}</tbody></table>{coupons.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Chưa có mã giảm giá.</p>}</div>
    </div>
  );
}
