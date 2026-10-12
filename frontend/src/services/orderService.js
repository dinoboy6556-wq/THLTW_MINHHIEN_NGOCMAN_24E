import api from '@/lib/axios';

const URL = '/admin/orders';

const orderService = {
  // Lấy danh sách tất cả đơn hàng
  getAll: async () => {
    try {
      return await api.get(URL);
    } catch {
      return await api.get('/orders');
    }
  },

  // Lấy chi tiết 1 đơn hàng (kèm thông tin sản phẩm và người mua)
  getById: (id) => api.get(`${URL}/${id}`),

  // Cập nhật trạng thái đơn hàng (0: Chờ xử lý, 1: Đã xác nhận, 2: Đang giao, 3: Đã giao, 4: Đã hủy)
  updateStatus: (id, status) => api.put(`${URL}/${id}/status`, { status }),

  // Xóa đơn hàng
  remove: (id) => api.delete(`${URL}/${id}`),
};

export default orderService;