"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/axios";

const statuses = {
  0: ["Chờ xác nhận", "bg-amber-100 text-amber-800"],
  1: ["Đã xác nhận", "bg-blue-100 text-blue-800"],
  2: ["Đang giao hàng", "bg-indigo-100 text-indigo-800"],
  3: ["Đã giao", "bg-emerald-100 text-emerald-800"],
  4: ["Đã hủy", "bg-red-100 text-red-800"],
};
const steps = ["Đã đặt", "Đã xác nhận", "Đang giao", "Đã giao"];
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [requestByOrder, setRequestByOrder] = useState({});
  const [requestMessage, setRequestMessage] = useState("");
  const [requestBusy, setRequestBusy] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await api.get("/my-orders", { params: { page } });
        const pageData = response.data?.data;
        if (isMounted) {
          setOrders(Array.isArray(pageData?.data) ? pageData.data : []);
          setLastPage(Number(pageData?.last_page || 1));
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setOrders([]);
          setError(
            requestError.response?.status === 401
              ? "Đăng nhập để theo dõi đơn hàng của bạn."
              : requestError.response?.data?.message ||
                "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(loadOrders);
    return () => {
      isMounted = false;
    };
  }, [page]);

  useEffect(() => {
    let isMounted = true;
    api.get("/my-order-requests", { params: { per_page: 100 } }).then((response) => {
      const records = response.data?.data?.data || [];
      if (isMounted) setRequestByOrder(Object.fromEntries(records.map((item) => [`${item.order_id}:${item.type}`, item])));
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [orders]);

  const submitOrderRequest = async (order, type) => {
    const reason = window.prompt(type === "cancel" ? "Lý do muốn hủy đơn hàng:" : "Lý do muốn trả hàng:");
    if (reason === null) return;
    if (reason.trim().length < 5) {
      setRequestMessage("Vui lòng nhập lý do tối thiểu 5 ký tự.");
      return;
    }
    setRequestBusy(order.id);
    setRequestMessage("");
    try {
      await api.post(`/my-orders/${order.id}/requests`, { type, reason: reason.trim() });
      setRequestMessage("Đã gửi yêu cầu. Bạn có thể theo dõi trạng thái tại đây.");
      const response = await api.get("/my-order-requests", { params: { per_page: 100 } });
      const records = response.data?.data?.data || [];
      setRequestByOrder(Object.fromEntries(records.map((item) => [`${item.order_id}:${item.type}`, item])));
    } catch (requestError) {
      setRequestMessage(getErrorMessage(requestError));
    } finally { setRequestBusy(null); }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
            <p className="mt-1 text-sm text-gray-500">Theo dõi xử lý, giao hàng và thanh toán.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            Tiếp tục mua sắm
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {[1, 2].map((item) => <div key={item} className="h-40 animate-pulse bg-gray-100" />)}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm text-amber-900">{error}</p>
            {error.startsWith("Đăng nhập") && (
              <Link href="/login" className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Đăng nhập
              </Link>
            )}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-gray-900">Chưa có đơn hàng</h2>
            <p className="mt-2 text-sm text-gray-500">Các đơn hàng đặt khi đăng nhập sẽ xuất hiện tại đây.</p>
            <Link href="/products" className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {requestMessage && <p role="status" className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800">{requestMessage}</p>}
            {orders.map((order) => {
              const status = Number(order.status ?? 0);
              const statusInfo = statuses[status] || statuses[0];
              const cancelled = status === 4;

              return (
                <article key={order.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{order.order_code || `Đơn hàng #${order.id}`}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Đặt lúc {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "Đang cập nhật"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo[1]}`}>{statusInfo[0]}</span>
                  </header>

                  <div className="grid gap-6 px-5 py-5 md:grid-cols-[1fr_260px]">
                    <div>
                      <ol className="mb-5 grid grid-cols-4 gap-2" aria-label="Tiến độ đơn hàng">
                        {steps.map((label, index) => {
                          const reached = !cancelled && status >= index;
                          return (
                            <li key={label} className="flex flex-col gap-2">
                              <span className={`h-1 rounded-full ${reached ? "bg-emerald-500" : "bg-gray-200"}`} />
                              <span className={`text-[11px] ${reached ? "font-semibold text-gray-800" : "text-gray-400"}`}>{label}</span>
                            </li>
                          );
                        })}
                      </ol>
                      <ul className="divide-y divide-gray-100">
                        {(order.items || []).map((item) => (
                          <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                            <span className="text-gray-700">{item.product?.name || `Sản phẩm #${item.product_id}`} × {item.quantity}</span>
                            <span className="shrink-0 font-medium text-gray-900">{money(Number(item.price) * Number(item.quantity))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <dl className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <div className="flex justify-between gap-3">
                        <dt className="text-gray-500">Thanh toán</dt>
                        <dd className="text-right font-medium text-gray-800">{order.payment_method === "vnpay" ? "VNPAY (chuyển khoản / QR)" : order.payment_method === "qr" ? "QR MoMo" : order.payment_method === "bank_transfer" ? "Chuyển khoản" : "Khi nhận hàng"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-gray-500">Trạng thái trả tiền</dt>
                        <dd className="text-right font-medium text-gray-800">{order.payment_status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-gray-500">Giao đến</dt>
                        <dd className="max-w-40 text-right text-gray-800">{order.shipping_address || order.cus_address}</dd>
                      </div>
                      <div className="mt-auto flex justify-between gap-3 border-t border-gray-100 pt-3">
                        <dt className="font-semibold text-gray-900">Tổng thanh toán</dt>
                        <dd className="font-bold text-indigo-700">{money(order.total_amount)}</dd>
                      </div>
                      {(() => {
                        const requestType = status === 3 ? "return" : "cancel";
                        const request = requestByOrder[`${order.id}:${requestType}`];
                        const canRequest = status === 3 || status === 0 || status === 1;
                        return canRequest ? <div className="border-t border-gray-100 pt-3">{request && request.status !== "rejected" ? <p className="text-xs text-amber-700">Yêu cầu {request.type === "cancel" ? "hủy" : "trả hàng"}: {request.status === "pending" ? "đang chờ duyệt" : "đã duyệt"}</p> : <button type="button" disabled={requestBusy === order.id} onClick={() => submitOrderRequest(order, requestType)} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">{requestBusy === order.id ? "Đang gửi…" : request?.status === "rejected" ? "Gửi lại yêu cầu" : status === 3 ? "Yêu cầu trả hàng" : "Yêu cầu hủy đơn"}</button>}</div> : null;
                      })()}
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && lastPage > 1 && (
          <nav className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4" aria-label="Phân trang đơn hàng">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              Trước
            </button>
            <span className="text-xs text-gray-500">Trang {page} / {lastPage}</span>
            <button type="button" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              Sau
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
