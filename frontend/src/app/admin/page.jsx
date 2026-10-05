export default function AdminDashboardPage() {
  const stats = [
    { title: 'Doanh thu tháng', value: '128.500.000 đ', color: 'bg-blue-500' },
    { title: 'Tổng Sản phẩm', value: '48', color: 'bg-green-500' },
    { title: 'Danh mục', value: '12', color: 'bg-purple-500' },
    { title: 'Đơn hàng mới', value: '15', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Thống Kê Tổng Quan</h2>
      
      {/* THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <div className={`h-1.5 w-12 ${stat.color} rounded-full mt-3`}></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Hoạt động gần đây</h3>
        <p className="text-gray-500 text-sm">Hệ thống backend Laravel API đang hoạt động bình thường.</p>
      </div>
    </div>
  );
}