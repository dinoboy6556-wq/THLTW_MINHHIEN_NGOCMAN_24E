import api from '@/lib/axios';

const URL = '/admin/categories';

const categoryService = {
  // Lấy danh sách cho Admin (kèm cả mục ẩn)
  getAll: async () => {
    try {
      return await api.get(URL);
    } catch {
      // Fallback nếu chưa cấu hình route admin
      return await api.get('/categories');
    }
  },
  getById: (id) => api.get(`${URL}/${id}`),
  create: (data) => api.post(URL, data),
  update: (id, data) => api.put(`${URL}/${id}`, data),
  remove: (id) => api.delete(`${URL}/${id}`),
};

export default categoryService;