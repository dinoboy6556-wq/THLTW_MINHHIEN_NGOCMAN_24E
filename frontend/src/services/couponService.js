import api from '@/lib/axios';

const couponService = {
  validate: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  getAdminAll: (params) => api.get('/admin/coupons', { params }),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  remove: (id) => api.delete(`/admin/coupons/${id}`),
};

export default couponService;
