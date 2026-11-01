"use client";

import { useState, useEffect, useCallback } from "react";
import orderService from "@/services/orderService";
import { getErrorMessage } from "@/lib/axios";

const getProductImageUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (/^https?:\/\//i.test(thumbnail)) return thumbnail;

  const imagePath = thumbnail.replace(/^\/+/, "").replace(/^storage\//, "");
  return `/backend-storage/${imagePath}`;
};

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Modal Chi tiết Đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // States Tìm kiếm, Lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Cấu hình nhãn và màu sắc Trạng Thái Đơn Hàng
  const ORDER_STATUS_MAP = {
    0: { label: "Chờ xử lý", bg: "bg-amber-100", text: "text-amber-800" },
    1: { label: "Đã xác nhận", bg: "bg-blue-100", text: "text-blue-800" },
    2: {
      label: "Đang giao hàng",
      bg: "bg-indigo-100",
      text: "text-indigo-800",
    },
    3: {
      label: "Đã hoàn thành",
      bg: "bg-emerald-100",
      text: "text-emerald-800",
    },
    4: { label: "Đã hủy", bg: "bg-red-100", text: "text-red-800" },
  };

  // Hàm bóc tách mảng an toàn
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // Tải danh sách đơn hàng
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await orderService.getAll();
      const extractedList = extractArray(res.data);
      setOrders(extractedList);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error("Lỗi API Đơn hàng:", errorMsg);
      setApiError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadOrders();
    });
  }, [loadOrders]);

  // Mở Modal xem chi tiết
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Cập nhật Trạng thái đơn hàng
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await orderService.updateStatus(orderId, Number(newStatus));
      alert("Cập nhật trạng thái đơn hàng thành công!");

      // Cập nhật lại dữ liệu tại chỗ
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: Number(newStatus) }));
      }
      loadOrders();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Xóa đơn hàng
  const handleDeleteOrder = async (id) => {
    if (!confirm("Chuyển đơn hàng này vào thùng rác?")) return;

    try {
      await orderService.remove(id);
      alert("Đã chuyển đơn hàng vào thùng rác.");
      if (selectedOrder?.id === id) setIsModalOpen(false);
      loadOrders();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // BỘ LỌC VÀ PHÂN TRANG
  const orderList = Array.isArray(orders) ? orders : [];
  const filteredOrders = orderList.filter((order) => {
    const matchesSearch =
      String(order.id).includes(searchTerm) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || String(order.status) === String(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản Lý Đơn Hàng & Giỏ Hàng
          </h2>
          <p className="text-sm text-gray-500">
            Theo dõi, duyệt đơn và quản lý vận chuyển
          </p>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between items-center">
          <span>
            ⚠️ <b>Lỗi kết nối API:</b> {apiError}
          </span>
          <button
            onClick={loadOrders}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* BẢNG VÀ THANH LỌC */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm theo Mã đơn, Tên khách hàng, Số điện thoại..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
              🔍
            </span>
          </div>

          <div className="w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="0">Chờ xử lý</option>
              <option value="1">Đã xác nhận</option>
              <option value="2">Đang giao hàng</option>
              <option value="3">Đã hoàn thành</option>
              <option value="4">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Đang tải danh sách đơn hàng...
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không tìm thấy đơn hàng nào phù hợp.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
                  <th className="p-4">Mã Đơn</th>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Ngày Đặt</th>
                  <th className="p-4">Tổng Tiền</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {paginatedOrders.map((order) => {
                  const statusInfo =
                    ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP[0];

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="p-4 font-bold text-indigo-600">
                        #{order.id}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">
                          {order.customer_name || "Khách vãng lai"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.phone || "Chưa có SĐT"}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        {Number(
                          order.total_amount || order.total || 0,
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {Number(order.status) === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Xác nhận đơn hàng #${order.id}?`,
                                  )
                                ) {
                                  handleStatusChange(order.id, 1);
                                }
                              }}
                              disabled={updatingStatus}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Xác nhận
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            title="Chuyển vào thùng rác"
                            aria-label="Chuyển đơn hàng vào thùng rác"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                          >
                            🗑️
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
                {Math.min(startIndex + itemsPerPage, filteredOrders.length)} /{" "}
                {filteredOrders.length} đơn hàng
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 border rounded-md text-xs font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-100 bg-white"
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
                  className="px-3 py-1 border rounded-md text-xs font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-100 bg-white"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL CHI TIẾT ĐƠN HÀNG ================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Chi Tiết Đơn Hàng #{selectedOrder.id}
                </h3>
                <p className="text-xs text-gray-500">
                  Thời gian đặt:{" "}
                  {selectedOrder.created_at
                    ? new Date(selectedOrder.created_at).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Thông tin khách hàng & Địa chỉ */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
              <div>
                <span className="text-xs text-gray-400 block mb-1">
                  Thông tin người mua
                </span>
                <p className="font-semibold text-gray-800">
                  {selectedOrder.customer_name || "Khách vãng lai"}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedOrder.phone || "Chưa có SĐT"}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedOrder.email || "Chưa có Email"}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-1">
                  Địa chỉ giao hàng
                </span>
                <p className="text-xs text-gray-700 font-medium">
                  {selectedOrder.shipping_address ||
                    selectedOrder.address ||
                    "Giao tại cửa hàng / Chưa nhập địa chỉ"}
                </p>
              </div>
              <div className="col-span-2 border-t border-gray-200 pt-3">
                <span className="text-xs text-gray-400 block mb-1">
                  Thanh toán
                </span>
                <p className="text-xs text-gray-700">
                  {selectedOrder.payment_method === "vnpay"
                    ? "VNPAY (chuyển khoản / QR)"
                    : selectedOrder.payment_method === "bank_transfer"
                      ? "Chuyển khoản ngân hàng"
                      : "Thanh toán khi nhận hàng"}
                  {" · "}
                  {selectedOrder.payment_status === "paid"
                    ? "Đã thanh toán"
                    : "Chờ thanh toán"}
                  {selectedOrder.shipping_fee > 0 &&
                    ` · Phí giao hàng ${Number(selectedOrder.shipping_fee).toLocaleString("vi-VN")} đ`}
                </p>
              </div>
            </div>

            {/* Danh sách sản phẩm trong giỏ/đơn */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-gray-800">
                Sản Phẩm Đã Đặt
              </h4>
              <div className="border rounded-xl divide-y overflow-hidden max-h-48 overflow-y-auto">
                {(selectedOrder.items || selectedOrder.order_items || []).map(
                  (item, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between gap-4 bg-white text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.thumbnail || item.product?.thumbnail ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={getProductImageUrl(
                                item.thumbnail || item.product?.thumbnail,
                              )}
                              alt={item.name || item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              No img
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-xs">
                            {item.name ||
                              item.product_name ||
                              item.product?.name ||
                              "Sản phẩm"}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {Number(item.price).toLocaleString("vi-VN")} đ x{" "}
                            {item.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-gray-800 text-xs">
                        {(Number(item.price) * item.quantity).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Cập nhật Trạng thái */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  Đổi trạng thái:
                </span>
                <select
                  disabled={updatingStatus}
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  className="px-3 py-1.5 border rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={0}>⏳ Chờ xử lý</option>
                  <option value={1}>✅ Đã xác nhận</option>
                  <option value={2}>🚚 Đang giao hàng</option>
                  <option value={3}>🎉 Đã hoàn thành</option>
                  <option value={4}>❌ Đã hủy</option>
                </select>
              </div>

              <div className="text-right w-full sm:w-auto">
                <span className="text-xs text-gray-500 block">
                  Tổng tiền đơn hàng
                </span>
                <span className="text-lg font-extrabold text-indigo-600">
                  {Number(
                    selectedOrder.total_amount || selectedOrder.total || 0,
                  ).toLocaleString("vi-VN")}{" "}
                  đ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
