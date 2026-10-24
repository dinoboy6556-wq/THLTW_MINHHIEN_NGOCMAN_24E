import api from "@/lib/axios";

const postService = {
  getPublished: () => api.get("/posts"),
  getPublishedBySlug: (slug) => api.get(`/posts/${slug}`),
  getAdminAll: (params) => api.get("/admin/posts", { params }),
  create: (data) => api.post("/admin/posts", data),
  update: (id, data) => api.put(`/admin/posts/${id}`, data),
  remove: (id) => api.delete(`/admin/posts/${id}`),
};

export default postService;
