import api from '@/lib/axios';

const productService = {
  // Dành cho Trang chủ & Cửa hàng (Public - Không bị dính 403)
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),

  // Dành riêng cho trang Admin Dashboard
  getAdminAll: () => api.get('/admin/products'),
  getAdminById: (id) => api.get(`/admin/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.post(`/admin/products/${id}`, data),
  remove: (id) => api.delete(`/admin/products/${id}`),
};

export default productService;