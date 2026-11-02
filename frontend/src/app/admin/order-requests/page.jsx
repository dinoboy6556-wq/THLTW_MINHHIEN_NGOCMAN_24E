"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/axios";

export default function AdminOrderRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await api.get("/admin/order-requests", { params: { per_page: 100 } });
      setRequests(response.data?.data?.data || []);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const processRequest = async (item, status) => {
    const adminNote = window.prompt("Ghi chú xử lý (có thể để trống):", "") ?? null;
    if (adminNote === null) return;
    setBusyId(item.id);
    try { await api.put(`/admin/order-requests/${item.id}`, { status, admin_note: adminNote }); await load(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusyId(null); }
  };

  return <div className="flex flex-col gap-6">
    <header><h1 className="text-2xl font-bold text-gray-900">Yêu cầu hủy và trả hàng</h1><p className="mt-1 text-sm text-gray-500">Duyệt yêu cầu sẽ cập nhật trạng thái và tồn kho trong cùng một giao dịch.</p></header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {requests.length === 0 ? <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">Chưa có yêu cầu nào.</div> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Đơn hàng</th><th className="p-3">Khách hàng</th><th className="p-3">Loại</th><th className="p-3">Lý do</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead><tbody className="divide-y">{requests.map((item) => <tr key={item.id} className="align-top"><td className="p-3 font-semibold">{item.order?.order_code || `#${item.order_id}`}</td><td className="p-3">{item.user?.username || "Khách hàng"}<br /><span className="text-xs text-gray-500">{item.user?.email}</span></td><td className="p-3">{item.type === "cancel" ? "Hủy đơn" : "Trả hàng"}</td><td className="max-w-sm whitespace-pre-line p-3">{item.reason}{item.admin_note && <p className="mt-2 text-xs text-gray-500">Ghi chú: {item.admin_note}</p>}</td><td className="p-3">{item.status === "pending" ? "Đang chờ" : item.status === "approved" ? "Đã duyệt" : "Đã từ chối"}</td><td className="p-3">{item.status === "pending" && <div className="flex gap-2"><button disabled={busyId === item.id} onClick={() => processRequest(item, "approved")} className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Duyệt</button><button disabled={busyId === item.id} onClick={() => processRequest(item, "rejected")} className="rounded bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">Từ chối</button></div>}</td></tr>)}</tbody></table></div>}
  </div>;
}
