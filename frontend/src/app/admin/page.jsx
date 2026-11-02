"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import adminDashboardService from '@/services/adminDashboardService';
import { getErrorMessage } from '@/lib/axios';

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN');
const EMPTY_DAILY_REVENUE = [];

const ORDER_STATUS = {
  0: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-800' },
  1: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
  2: { label: 'Đang giao', className: 'bg-indigo-100 text-indigo-800' },
  3: { label: 'Đã hoàn thành', className: 'bg-emerald-100 text-emerald-800' },
  4: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminDashboardService.getSummary();
      setDashboard(response.data?.data ?? null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadDashboard);
  }, [loadDashboard]);

  const stats = dashboard?.stats;
  const dailyRevenue = dashboard?.revenue_last_seven_days ?? EMPTY_DAILY_REVENUE;
  const recentOrders = dashboard?.recent_orders ?? [];
  const orderStatuses = dashboard?.order_statuses ?? [];

  const maximumRevenue = useMemo(
    () => Math.max(1, ...dailyRevenue.map((day) => Number(day.revenue) || 0)),
    [dailyRevenue],
  );

  const cards = [
    {
      title: 'Doanh số tháng này',
      value: stats ? CURRENCY_FORMATTER.format(stats.monthly_revenue) : '—',
      detail: `${NUMBER_FORMATTER.format(stats?.orders_this_month ?? 0)} đơn chưa hủy`,
      icon: '💰',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Đơn chờ xử lý',
      value: stats ? NUMBER_FORMATTER.format(stats.pending_orders) : '—',
      detail: 'Cần được xác nhận',
      icon: '🛒',
      color: 'from-orange-400 to-amber-500',
    },
    {
      title: 'Sản phẩm đang bán',
      value: stats ? NUMBER_FORMATTER.format(stats.active_products) : '—',
      detail: `${NUMBER_FORMATTER.format(stats?.active_categories ?? 0)} danh mục hoạt động`,
      icon: '📦',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Người dùng hoạt động',
      value: stats ? NUMBER_FORMATTER.format(stats.active_users) : '—',
      detail: `${NUMBER_FORMATTER.format(stats?.published_posts ?? 0)} bài viết đã đăng`,
      icon: '👥',
      color: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="mt-1 text-sm text-gray-500">Số liệu được cập nhật trực tiếp từ hệ thống.</p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
        >
          {loading ? 'Đang tải…' : '↻ Làm mới'}
        </button>
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Không tải được số liệu: {error}</span>
          <button type="button" onClick={loadDashboard} className="font-semibold underline">Thử lại</button>
        </div>
      )}

      <section aria-label="Chỉ số chính" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />
            <div className="flex items-start justify-between p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 truncate text-2xl font-bold text-gray-900">
                  {loading ? <span className="inline-block h-7 w-28 animate-pulse rounded bg-gray-100" /> : card.value}
                </p>
                <p className="mt-2 text-xs text-gray-400">{card.detail}</p>
              </div>
              <span className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl" aria-hidden="true">
                {card.icon}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-900">Doanh số 7 ngày gần nhất</h2>
              <p className="mt-1 text-xs text-gray-500">Đơn đã tạo, không tính đơn đã hủy</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">7 ngày</span>
          </div>

          <div className="mt-6 grid h-52 grid-cols-7 items-end gap-2 sm:gap-4">
            {dailyRevenue.map((day) => {
              const revenue = Number(day.revenue) || 0;
              const height = revenue > 0 ? Math.max(8, (revenue / maximumRevenue) * 100) : 4;

              return (
                <div key={day.date} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                  <span className="hidden max-w-full truncate text-[10px] text-gray-400 sm:block" title={CURRENCY_FORMATTER.format(revenue)}>
                    {revenue > 0 ? CURRENCY_FORMATTER.format(revenue) : '—'}
                  </span>
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-400 transition-all"
                      style={{ height: `${height}%` }}
                      title={`${day.label}: ${CURRENCY_FORMATTER.format(revenue)} (${day.order_count} đơn)`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">{day.label}</span>
                </div>
              );
            })}
            {!loading && dailyRevenue.length === 0 && (
              <p className="col-span-7 self-center text-center text-sm text-gray-400">Chưa có dữ liệu trong khoảng thời gian này.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-900">Trạng thái đơn hàng</h2>
              <p className="mt-1 text-xs text-gray-500">Các đơn chưa xóa</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Quản lý</Link>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {orderStatuses.map((item) => {
              const status = ORDER_STATUS[item.status] ?? ORDER_STATUS[0];
              return (
                <div key={item.status} className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  <span className="text-sm font-bold text-gray-800">{NUMBER_FORMATTER.format(item.total)}</span>
                </div>
              );
            })}
            {!loading && orderStatuses.length === 0 && <p className="text-sm text-gray-400">Chưa có đơn hàng.</p>}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Đơn hàng gần đây</h2>
            <p className="mt-1 text-xs text-gray-500">8 đơn mới nhất, không bao gồm mục trong thùng rác</p>
          </div>
          <Link href="/admin/orders" className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800">Xem tất cả</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Đang tải đơn hàng…</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">Chưa có đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Mã đơn</th>
                  <th className="px-5 py-3 font-semibold">Khách hàng</th>
                  <th className="px-5 py-3 font-semibold">Ngày đặt</th>
                  <th className="px-5 py-3 text-right font-semibold">Tổng tiền</th>
                  <th className="px-5 py-3 text-right font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS[0];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3 font-semibold text-indigo-700">{order.order_code || `#${order.id}`}</td>
                      <td className="px-5 py-3 text-gray-700">{order.customer_name || 'Khách vãng lai'}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">{CURRENCY_FORMATTER.format(order.total_amount)}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
