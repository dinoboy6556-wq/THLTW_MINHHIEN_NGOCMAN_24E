import api from '@/lib/axios';

const categoryService = {
  // Dành cho Trang chủ & Cửa hàng (Public)
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),

  // Dành riêng cho trang Admin Dashboard
  getAdminAll: (params) => api.get('/admin/categories', { params }),
  getAdminById: (id) => api.get(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  remove: (id) => api.delete(`/admin/categories/${id}`),
};

export default categoryService;
