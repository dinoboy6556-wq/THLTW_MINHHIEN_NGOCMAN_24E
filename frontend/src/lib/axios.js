import axios from 'axios';

// 1. Tạo instance Axios chuẩn
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
  timeout: 10000,
});

// 2. [ƯU ĐIỂM BÀI CỦ] Tự động gắn Token đăng nhập vào mọi Request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/admin')
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

export default api;

// 3. Hàm hỗ trợ đọc câu thông báo lỗi
export function getErrorMessage(error) {
  if (error.response) {
    return error.response.data?.message || `Lỗi ${error.response.status}`;
  }
  return 'Không thể kết nối đến máy chủ API Laravel. Vui lòng kiểm tra backend!';
}