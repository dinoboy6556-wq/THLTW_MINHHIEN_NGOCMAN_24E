import api from '@/lib/axios';

const URL = '/admin/products';

const productService = {
  // Lấy danh sách sản phẩm (Tự động fallback về public nếu chưa mở route admin)
  getAll: async () => {
    try {
      return await api.get(URL);
    } catch {
      return await api.get('/products');
    }
  },
  getById: (id) => api.get(`${URL}/${id}`),
  create: (data) => api.post(URL, data),
  update: (id, data) => api.put(`${URL}/${id}`, data),
  remove: (id) => api.delete(`${URL}/${id}`),
};

export default productService;