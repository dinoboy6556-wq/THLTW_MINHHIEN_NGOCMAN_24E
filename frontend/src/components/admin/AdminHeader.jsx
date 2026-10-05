'use client';

export default function AdminHeader({ adminUser, onLogout }) {
  return (
    <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center border-b border-gray-100">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Trang Quản Trị Hệ Thống</h1>
        <p className="text-xs text-gray-500">Quản lý cửa hàng và danh mục dữ liệu</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase">
            {adminUser?.username ? adminUser.username.charAt(0) : 'A'}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-800">{adminUser?.username || 'Admin'}</p>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
              {adminUser?.role || 'admin'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl transition font-medium border border-red-100"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}