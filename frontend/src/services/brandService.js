import api from '@/lib/axios';

const URL = '/admin/brands';

const brandService = {
  // Lấy danh sách thương hiệu (Tự động fallback nếu chưa mở route admin)
  getAll: async () => {
    try {
      return await api.get(URL);
    } catch {
      return await api.get('/brands');
    }
  },
  getById: (id) => api.get(`${URL}/${id}`),
  create: (data) => api.post(URL, data),
  update: (id, data) => api.put(`${URL}/${id}`, data),
  remove: (id) => api.delete(`${URL}/${id}`),
};

export default brandService;