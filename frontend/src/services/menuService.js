import api from '@/lib/axios';

const menuService = {
  getPublic: () => api.get('/menus'),
  getAdminAll: () => api.get('/admin/menus'),
  create: (data) => api.post('/admin/menus', data),
  update: (id, data) => api.put(`/admin/menus/${id}`, data),
  remove: (id) => api.delete(`/admin/menus/${id}`),
};

export default menuService;
