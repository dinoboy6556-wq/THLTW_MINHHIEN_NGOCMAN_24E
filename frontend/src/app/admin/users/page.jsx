"use client";

import { useState, useEffect, useCallback } from "react";
import userService from "@/services/userService";
import { getErrorMessage } from "@/lib/axios";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Thông tin và vai trò của tài khoản thực tế đang đăng nhập
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("member");

  // State Modal Chi tiết & Đơn hàng của người dùng
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States Tìm kiếm, Lọc & Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Tự động đọc thông tin người dùng đang đăng nhập từ Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawUserData =
        localStorage.getItem("user_info") || localStorage.getItem("user");
      if (rawUserData) {
        try {
          const parsedUser = JSON.parse(rawUserData);
          queueMicrotask(() => {
            setCurrentUser(parsedUser);
            setCurrentUserRole(parsedUser.role || "admin");
          });
        } catch (err) {
          console.error("Lỗi đọc dữ liệu người dùng từ LocalStorage:", err);
        }
      }
    }
  }, []);

  // Hàm bóc tách mảng an toàn
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // Tải danh sách người dùng
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await userService.getAll();
      setUsers(extractArray(res.data));
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error("Lỗi API Người dùng:", errorMsg);
      setApiError(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadUsers();
    });
  }, [loadUsers]);

  // Xem chi tiết người dùng và đơn hàng của họ
  const handleViewDetails = async (userId) => {
    setLoadingDetails(true);
    setIsModalOpen(true);
    try {
      const res = await userService.getById(userId);
      const userData = res.data;
      setSelectedUser(userData);
      setUserOrders(extractArray(userData.orders));
    } catch (err) {
      alert(getErrorMessage(err));
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Khóa / Mở khóa tài khoản người dùng
  const handleToggleBlock = async (user) => {
    const isBlocking = user.status == 1;
    const actionName = isBlocking ? "KHÓA" : "MỞ KHÓA";

    if (
      !confirm(
        `Bạn có chắc chắn muốn ${actionName} tài khoản "${user.username}"?`,
      )
    ) {
      return;
    }

    try {
      // Truyền đúng role và id của người dùng thực tế đang đăng nhập
      const res = await userService.toggleBlock(
        user.id,
        currentUserRole,
        currentUser?.id,
      );
      alert(res.data.message || "Thao tác thành công!");

      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => ({ ...prev, status: isBlocking ? 0 : 1 }));
      }
      loadUsers();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleSoftDelete = async (user) => {
    if (!canDelete(user)) return;
    if (!confirm(`Chuyển tài khoản "${user.username}" vào thùng rác?`)) return;

    try {
      const response = await userService.remove(user.id);
      alert(response.data.message || 'Đã chuyển tài khoản vào thùng rác.');
      loadUsers();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  // Kiểm tra quyền khóa trên Giao diện
  const canBlock = (targetUser) => {
    if (targetUser.role === "super_admin") return false; // Không thể khóa Super Admin
    if (currentUserRole === "super_admin") return true; // Super Admin khóa được Admin và Member
    if (currentUserRole === "admin" && targetUser.role === "member")
      return true; // Admin chỉ khóa được Member
    return false;
  };

  const canDelete = (targetUser) => {
    if (targetUser.role === 'super_admin' || targetUser.id === currentUser?.id) return false;
    if (currentUserRole === 'super_admin') return true;
    return currentUserRole === 'admin' && targetUser.role === 'member';
  };

  // BỘ LỌC VÀ PHÂN TRANG
  const userList = Array.isArray(users) ? users : [];
  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || String(u.status) === String(statusFilter);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* TIÊU ĐỀ & HIỂN THỊ TÀI KHOẢN ĐANG ĐĂNG NHẬP */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản Lý Người Dùng
          </h2>
          <p className="text-sm text-gray-500">
            Xem danh sách, chi tiết đơn hàng và phân quyền khóa tài khoản
          </p>
        </div>

        {/* Badge tĩnh hiển thị đúng người dùng và vai trò - Không thể chọn đổi */}
        <div className="bg-white p-2.5 border rounded-xl shadow-sm flex items-center gap-2 text-xs">
          <span className="font-semibold text-gray-500">Tài khoản:</span>
          <span className="font-bold text-gray-800">
            {currentUser?.username || currentUser?.name || "Admin"}
          </span>
          <span
            className={`font-bold px-2.5 py-1 rounded-lg border ${
              currentUserRole === "super_admin"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : currentUserRole === "admin"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {currentUserRole === "super_admin"
              ? "👑 Super Admin"
              : currentUserRole === "admin"
                ? "🛡️ Admin"
                : "👤 Member"}
          </span>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between items-center">
          <span>
            ⚠️ <b>Lỗi kết nối API:</b> {apiError}
          </span>
          <button
            onClick={loadUsers}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* THANH TÌM KIẾM VÀ BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo Username, Email, Số điện thoại..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>
        </div>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="member">Thành viên (Member)</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Đã bị khóa</option>
          </select>
        </div>
      </div>

      {/* BẢNG DANH SÁCH NGƯỜI DÙNG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Đang tải danh sách người dùng...
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
                <th className="p-4">ID</th>
                <th className="p-4">Tài Khoản / Email</th>
                <th className="p-4">Số Điện Thoại</th>
                <th className="p-4 text-center">Vai Trò</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {paginatedUsers.map((u) => {
                const isActive = u.status == 1;
                const isSuperAdmin = u.role === "super_admin";
                const isAdmin = u.role === "admin";
                const allowBlock = canBlock(u);
                const allowDelete = canDelete(u);

                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-gray-700">#{u.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">
                        {u.username}
                      </div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="p-4 text-gray-600 text-xs">
                      {u.phone || "Chưa cập nhật"}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isSuperAdmin
                            ? "bg-purple-100 text-purple-800"
                            : isAdmin
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isSuperAdmin
                          ? "👑 Super Admin"
                          : isAdmin
                            ? "🛡️ Admin"
                            : "👤 Member"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(u.id)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                        >
                          Chi tiết
                        </button>

                        <button
                          disabled={!allowBlock}
                          onClick={() => handleToggleBlock(u)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                            !allowBlock
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                              : isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title={
                            !allowBlock
                              ? "Bạn không có quyền khóa tài khoản này"
                              : ""
                          }
                        >
                          {isActive ? "Khóa" : "Mở khóa"}
                        </button>

                        <button
                          type="button"
                          disabled={!allowDelete}
                          onClick={() => handleSoftDelete(u)}
                          title={!allowDelete ? 'Bạn không có quyền xóa tài khoản này' : ''}
                          className="rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Thùng rác
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
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} /{" "}
              {filteredUsers.length} người dùng
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

      {/* ================= MODAL CHI TIẾT NGƯỜI DÙNG & LỊCH SỬ ĐƠN HÀNG ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Thông Tin Chi Tiết Người Dùng #{selectedUser?.id}
                </h3>
                <p className="text-xs text-gray-500">
                  Hồ sơ cá nhân và lịch sử đơn hàng
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-gray-500">
                Đang tải thông tin chi tiết...
              </div>
            ) : selectedUser ? (
              <div className="flex flex-col gap-6">
                {/* THÔNG TIN CÁ NHÂN */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">
                      Tên tài khoản
                    </span>
                    <p className="font-bold text-gray-800">
                      {selectedUser.username}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">
                      Email
                    </span>
                    <p className="font-medium text-gray-800">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">
                      Số điện thoại
                    </span>
                    <p className="font-medium text-gray-800">
                      {selectedUser.phone || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">
                      Vai trò
                    </span>
                    <span className="font-semibold text-indigo-600 uppercase text-xs">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">
                      Trạng thái
                    </span>
                    <span
                      className={`font-semibold text-xs ${
                        selectedUser.status == 1
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedUser.status == 1 ? "Đang hoạt động" : "Bị khóa"}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-xs text-gray-400 block mb-1">
                      Địa chỉ giao hàng
                    </span>
                    <p className="text-gray-700">
                      {selectedUser.address || "Chưa cập nhật địa chỉ"}
                    </p>
                  </div>
                </div>

                {/* DANH SÁCH ĐƠN HÀNG ĐÃ ĐẶT */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-bold text-gray-800">
                    Lịch Sử Đơn Hàng ({userOrders.length} đơn)
                  </h4>

                  {userOrders.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl text-xs">
                      Người dùng này chưa đặt đơn hàng nào.
                    </div>
                  ) : (
                    <div className="border rounded-xl divide-y overflow-hidden max-h-60 overflow-y-auto">
                      {userOrders.map((order) => (
                        <div
                          key={order.id}
                          className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs gap-4"
                        >
                          <div>
                            <span className="font-bold text-indigo-600">
                              Mã đơn: #{order.id} ({order.order_code || "ORD"})
                            </span>
                            <div className="text-gray-400 text-[11px] mt-0.5">
                              Ngày đặt:{" "}
                              {order.created_at
                                ? new Date(order.created_at).toLocaleString(
                                    "vi-VN",
                                  )
                                : "N/A"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              {Number(order.total_amount || 0).toLocaleString(
                                "vi-VN",
                              )}{" "}
                              đ
                            </div>
                            <span className="text-[10px] text-gray-500">
                              {order.items?.length || 0} sản phẩm
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
