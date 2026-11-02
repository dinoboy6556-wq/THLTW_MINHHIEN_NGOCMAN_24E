import api from '@/lib/axios';

const productService = {
  // Dành cho Trang chủ & Cửa hàng (Public - Không bị dính 403)
  getAll: (params) => api.get('/products', { params }),
  getOnSale: (params = {}) => api.get('/products', { params: { ...params, on_sale: 1 } }),
  getById: (id) => api.get(`/products/${id}`),
  getReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  submitReview: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),
  getReactions: (productId) => api.get(`/products/${productId}/reactions`),
  updateReaction: (productId, reaction) =>
    api.put(`/products/${productId}/reaction`, { reaction }),
  addFavorite: (productId) => api.put(`/products/${productId}/favorite`),
  removeFavorite: (productId) => api.delete(`/products/${productId}/favorite`),

  // Dành riêng cho trang Admin Dashboard
  getAdminAll: (params) => api.get('/admin/products', { params }),
  getAdminById: (id) => api.get(`/admin/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) =>
    data instanceof FormData
      ? api.post(`/admin/products/${id}`, data)
      : api.put(`/admin/products/${id}`, data),
  remove: (id) => api.delete(`/admin/products/${id}`),
};

export default productService;
