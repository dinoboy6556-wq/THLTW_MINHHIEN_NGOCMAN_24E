import axios from 'axios';

// 1. Tạo instance Axios chuẩn
const api = axios.create({
  // Same-origin Next.js rewrite proxies the request to Laravel and avoids browser CORS issues.
  baseURL: '/backend-api',
  headers: {
    Accept: 'application/json',
  },
  // Wait for the API response without a client-side timeout.
  timeout: 0,
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

const validationFieldLabels = {
  name: "Tên",
  cate_id: "Danh mục",
  brand_id: "Thương hiệu",
  price: "Giá bán",
  promo_price: "Giá khuyến mãi",
  stock: "Tồn kho",
  thumbnail: "URL ảnh sản phẩm",
  thumbnail_file: "Ảnh sản phẩm",
  description: "Mô tả",
  status: "Trạng thái",
  title: "Tiêu đề",
  category: "Chuyên mục",
  excerpt: "Tóm tắt",
  content: "Nội dung",
  cover_image: "URL ảnh bìa",
  cover_image_file: "Ảnh bìa",
  logo: "Logo",
  parent_id: "Danh mục cha",
  url: "Đường dẫn",
  label: "Tên hiển thị",
  position: "Thứ tự",
  email: "Email",
  phone: "Số điện thoại",
  password: "Mật khẩu",
  role: "Vai trò",
};

function formatValidationMessage(message) {
  const text = String(message);

  if (/must be an image|must be a valid image/i.test(text)) {
    return "phải là tệp ảnh hợp lệ.";
  }

  const fileTypes = text.match(/must be a file of type:\s*(.+)\.?$/i);
  if (fileTypes) {
    return `không đúng định dạng. Chỉ chấp nhận: ${fileTypes[1]}.`;
  }

  const maxKilobytes = text.match(
    /may not be greater than\s*([\d,.]+)\s*kilobytes/i,
  );
  if (maxKilobytes) {
    const kilobytes = Number(maxKilobytes[1].replaceAll(",", ""));
    const limit = kilobytes >= 1024 ? `${kilobytes / 1024} MB` : `${kilobytes} KB`;
    return `vượt quá dung lượng cho phép (${limit}).`;
  }

  if (/field is required|is required/i.test(text)) {
    return "là thông tin bắt buộc.";
  }
  if (/has already been taken/i.test(text)) {
    return "đã được sử dụng. Vui lòng chọn giá trị khác.";
  }
  if (/does not exist|is invalid|selected .* is invalid/i.test(text)) {
    return "không hợp lệ hoặc không còn tồn tại.";
  }
  if (/must be a number|must be numeric/i.test(text)) {
    return "phải là số.";
  }
  if (/must be an integer/i.test(text)) {
    return "phải là số nguyên.";
  }
  if (/must be a valid email address|must be a valid email/i.test(text)) {
    return "không đúng định dạng.";
  }

  return text;
}

function getValidationMessages(errors) {
  if (!errors || typeof errors !== "object") return [];

  return Object.entries(errors).flatMap(([field, messages]) => {
    const values = Array.isArray(messages) ? messages : [messages];
    return values
      .filter((message) => typeof message === "string")
      .map(
        (message) =>
          `${validationFieldLabels[field] || field.replaceAll("_", " ")}: ${formatValidationMessage(message)}`,
      );
  });
}

// Hiển thị chi tiết lỗi API, đặc biệt là các lỗi validation Laravel trả về 422.
export function getErrorMessage(error) {
  if (error.response) {
    const { status, data } = error.response;
    const validationMessages = getValidationMessages(data?.errors);

    if (validationMessages.length) {
      return `Dữ liệu chưa hợp lệ:\n• ${validationMessages.join("\n• ")}`;
    }

    if (typeof data?.message === "string" && /SQLSTATE/i.test(data.message)) {
      if (/Duplicate entry[\s\S]*for key ['`"]products\.slug['`"]?/i.test(data.message)) {
        return "Slug sản phẩm đã bị trùng. Hãy thử lưu lại để hệ thống tạo đường dẫn riêng.";
      }
      if (/Duplicate entry/i.test(data.message)) {
        return "Dữ liệu bị trùng với mục đã có. Hãy kiểm tra tên hoặc mã định danh rồi thử lại.";
      }
      if (/Cannot add or update a child row/i.test(data.message)) {
        return "Không thể lưu vì dữ liệu liên quan không tồn tại hoặc đang bị ràng buộc.";
      }

      return "Cơ sở dữ liệu từ chối lưu dữ liệu. Hãy kiểm tra các trường liên quan và thử lại.";
    }

    if (data?.message) return data.message;

    const statusMessages = {
      400: "Yêu cầu không hợp lệ.",
      401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      403: "Bạn không có quyền thực hiện thao tác này.",
      404: "Không tìm thấy dữ liệu yêu cầu.",
      409: "Dữ liệu bị xung đột. Vui lòng tải lại và thử lại.",
      413: "Tệp tải lên quá lớn. Vui lòng chọn tệp nhỏ hơn.",
      422: "Dữ liệu gửi lên chưa hợp lệ. Hãy kiểm tra các trường vừa nhập.",
      429: "Bạn thao tác quá nhanh. Vui lòng chờ một chút rồi thử lại.",
      500: "Máy chủ gặp lỗi khi xử lý yêu cầu.",
      502: "Không kết nối được máy chủ API.",
      503: "Dịch vụ hiện chưa sẵn sàng.",
    };

    return statusMessages[status] || `Yêu cầu thất bại (HTTP ${status}).`;
  }

  return "Không thể kết nối đến máy chủ API Laravel. Vui lòng kiểm tra backend!";
}
