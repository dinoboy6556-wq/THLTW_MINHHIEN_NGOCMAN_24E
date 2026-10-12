import api from '@/lib/axios';

const brandService = {
  // Dành cho Trang chủ & Cửa hàng (Public)
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),

  // Dành riêng cho trang Admin Dashboard
  getAdminAll: () => api.get('/admin/brands'),
  getAdminById: (id) => api.get(`/admin/brands/${id}`),
  create: (data) => api.post('/admin/brands', data),
  update: (id, data) => api.put(`/admin/brands/${id}`, data),
  remove: (id) => api.delete(`/admin/brands/${id}`),
};

export default brandService;