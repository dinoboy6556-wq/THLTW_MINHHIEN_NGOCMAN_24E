import api from '@/lib/axios';

const trashService = {
  getAll: () => api.get('/admin/trash'),
  restore: (resource, id) => api.post(`/admin/trash/${resource}/${id}/restore`),
  removePermanently: (resource, id) => api.delete(`/admin/trash/${resource}/${id}`),
};

export default trashService;
