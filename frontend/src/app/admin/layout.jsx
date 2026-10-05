"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user_info") || "{}");

    if (!token || user.role !== "admin") {
      alert("Vui lòng đăng nhập tài khoản Admin!");
      router.push("/login");
    } else {
      queueMicrotask(() => {
        setAdminUser(user);
      });
    }
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      router.push("/login");
    }
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm font-medium">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR TÁCH RIÊNG */}
      <AdminSidebar onLogout={handleLogout} />

      {/* KHU VỰC CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER TOPBAR TÁCH RIÊNG */}
        <AdminHeader adminUser={adminUser} onLogout={handleLogout} />

        {/* NỘI DUNG TRANG */}
        <main className="p-8 flex-1">{children}</main>

        {/* FOOTER QUẢN TRỊ */}
        <footer className="bg-white border-t border-gray-100 px-8 py-3 text-center text-xs text-gray-400">
          © 2026 MyShop Admin Dashboard — Bảng điều khiển quản trị hệ thống
        </footer>
      </div>
    </div>
  );
}
