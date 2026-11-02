"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import trashService from '@/services/trashService';
import { getErrorMessage } from '@/lib/axios';

const RESOURCE_OPTIONS = [
  { value: 'all', label: 'Tất cả mục' },
  { value: 'products', label: 'Sản phẩm' },
  { value: 'categories', label: 'Danh mục' },
  { value: 'brands', label: 'Thương hiệu' },
  { value: 'posts', label: 'Bài viết' },
  { value: 'orders', label: 'Đơn hàng' },
  { value: 'users', label: 'Người dùng' },
  { value: 'menu_items', label: 'Menu' },
];

export default function AdminTrashPage() {
  const [items, setItems] = useState([]);
  const [resourceFilter, setResourceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');

  const loadTrash = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await trashService.getAll();
      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadTrash);
  }, [loadTrash]);

  const visibleItems = useMemo(
    () => items.filter((item) => resourceFilter === 'all' || item.resource === resourceFilter),
    [items, resourceFilter],
  );

  const handleRestore = async (item) => {
    const itemKey = `${item.resource}-${item.id}`;
    setBusyKey(itemKey);

    try {
      await trashService.restore(item.resource, item.id);
      setItems((previousItems) => previousItems.filter((previous) =>
        previous.resource !== item.resource || previous.id !== item.id,
      ));
    } catch (requestError) {
      alert(getErrorMessage(requestError));
    } finally {
      setBusyKey('');
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!confirm(`Xóa vĩnh viễn “${item.label}”? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    const itemKey = `${item.resource}-${item.id}`;
    setBusyKey(itemKey);

    try {
      await trashService.removePermanently(item.resource, item.id);
      setItems((previousItems) => previousItems.filter((previous) =>
        previous.resource !== item.resource || previous.id !== item.id,
      ));
    } catch (requestError) {
      alert(getErrorMessage(requestError));
    } finally {
      setBusyKey('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thùng rác</h1>
          <p className="mt-1 text-sm text-gray-500">
            Khôi phục mục đã xóa mềm hoặc xóa vĩnh viễn khi không còn cần nữa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
            {visibleItems.length} mục
          </span>
          <select
            value={resourceFilter}
            onChange={(event) => setResourceFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
            aria-label="Lọc loại mục trong thùng rác"
          >
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={loadTrash} className="font-semibold underline">Thử lại</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">Đang tải thùng rác…</div>
        ) : visibleItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl" aria-hidden="true">🗑️</div>
            <p className="mt-3 font-semibold text-gray-700">Thùng rác đang trống</p>
            <p className="mt-1 text-sm text-gray-500">Các mục bạn xóa sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleItems.map((item) => {
              const itemKey = `${item.resource}-${item.id}`;
              const isBusy = busyKey === itemKey;

              return (
                <div key={itemKey} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {item.resource_label}
                      </span>
                      <span className="text-xs text-gray-400">#{item.id}</span>
                    </div>
                    <h2 className="mt-2 truncate font-semibold text-gray-900">{item.label}</h2>
                    {item.details && <p className="mt-1 truncate text-sm text-gray-500">{item.details}</p>}
                    <p className="mt-1 text-xs text-gray-400">
                      Đã xóa: {item.deleted_at ? new Date(item.deleted_at).toLocaleString('vi-VN') : '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRestore(item)}
                      className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Khôi phục
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handlePermanentDelete(item)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
