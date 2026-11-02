import api from '@/lib/axios';

const adminDashboardService = {
  getSummary: () => api.get('/admin/dashboard'),
};

export default adminDashboardService;
