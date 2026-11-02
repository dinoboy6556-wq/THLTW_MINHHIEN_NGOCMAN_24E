"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import api from "@/lib/axios";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user_info") || "{}");

    if (!token || !["admin", "super_admin"].includes(user.role)) {
      alert("Vui lòng đăng nhập tài khoản Admin!");
      router.push("/login");
      return;
    }

    let active = true;

    api.get("/me")
      .then((response) => {
        const currentUser = response.data?.user;
        if (!active) return;

        if (!currentUser || !["admin", "super_admin"].includes(currentUser.role)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
          alert("Phiên đăng nhập không phải tài khoản Admin!");
          router.replace("/login");
          return;
        }

        localStorage.setItem("user_info", JSON.stringify(currentUser));
        setAdminUser(currentUser);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
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
