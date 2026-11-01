"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ onLogout }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Tổng quan", path: "/admin", icon: "📊" },
    { name: "Quản lý Danh mục", path: "/admin/categories", icon: "📁" },
    { name: "Quản lý Menu", path: "/admin/menus", icon: "🧭" },
    { name: "Quản lý Thương hiệu", path: "/admin/brands", icon: "🏷️" },
    { name: "Quản lý Sản phẩm", path: "/admin/products", icon: "📦" },
    { name: "Quản lý Bài viết", path: "/admin/posts", icon: "📝" },
    { name: "Quản lý Đơn hàng", path: "/admin/orders", icon: "🛒" },
    { name: "Quản lý Người dùng", path: "/admin/users", icon: "👥" }, // Thêm mục Quản lý Người dùng
    { name: "Thùng rác", path: "/admin/trash", icon: "🗑️" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 min-h-screen">
      <div>
        {/* LOGO */}
        <div className="text-xl font-bold p-3 border-b border-slate-800 text-indigo-400 flex items-center gap-2">
          <span>⚡</span> MYSHOP ADMIN
        </div>

        {/* MENU NHÓM */}
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER SIDEBAR */}
      <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
        <Link
          href="/"
          className="w-full text-left px-4 py-2.5 text-slate-400 hover:text-white text-xs font-medium transition flex items-center gap-2"
        >
          <span>🌐</span> Xem trang cửa hàng
        </Link>
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2.5 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
