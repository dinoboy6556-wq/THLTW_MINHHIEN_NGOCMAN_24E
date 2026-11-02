import api from '@/lib/axios';

const favoriteService = {
  getAll: (params) => api.get('/favorites', { params }),
};

export default favoriteService;
