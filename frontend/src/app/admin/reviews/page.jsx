"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/axios";

const badge = { pending: "bg-amber-100 text-amber-800", approved: "bg-emerald-100 text-emerald-800", rejected: "bg-red-100 text-red-800" };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await api.get("/admin/reviews", { params: { status: filter, per_page: 100 } });
      setReviews(response.data?.data?.data || []);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, [filter]);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const setStatus = async (review, status) => {
    setBusyId(review.id);
    try { await api.put(`/admin/reviews/${review.id}`, { status }); await load(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusyId(null); }
  };

  return <div className="flex flex-col gap-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-900">Kiểm duyệt đánh giá</h1><p className="mt-1 text-sm text-gray-500">Đánh giá mới chỉ hiện công khai sau khi được duyệt.</p></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm"><option value="pending">Chờ duyệt</option><option value="approved">Đã duyệt</option><option value="rejected">Từ chối</option></select></header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {reviews.length === 0 ? <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">Không có đánh giá trong trạng thái này.</div> : <div className="grid gap-4">{reviews.map((review) => <article key={review.id} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-gray-900">{review.product?.name || "Sản phẩm"}</p><p className="mt-1 text-xs text-gray-500">{review.user?.username || "Khách hàng"} · {review.created_at ? new Date(review.created_at).toLocaleString("vi-VN") : ""}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[review.status]}`}>{review.status}</span></div><p className="mt-3 text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</p><p className="mt-2 whitespace-pre-line text-sm text-gray-700">{review.comment}</p>{review.image_url && <img src={review.image_url} alt="Ảnh đính kèm đánh giá" className="mt-3 max-h-64 rounded-lg border object-contain" />}{review.status === "pending" && <div className="mt-4 flex gap-2"><button disabled={busyId === review.id} onClick={() => setStatus(review, "approved")} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Duyệt</button><button disabled={busyId === review.id} onClick={() => setStatus(review, "rejected")} className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Từ chối</button></div>}</article>)}</div>}
  </div>;
}
