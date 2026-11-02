import api from '@/lib/axios';

const URL = '/admin/users';

const userService = {
  getAll: () => api.get(URL),
  getById: (id) => api.get(`${URL}/${id}`),
  toggleBlock: (id, currentUserRole = 'super_admin', currentUserId = null) =>
    api.put(
      `${URL}/${id}/block`,
      {},
      {
        headers: {
          'X-Current-User-Role': currentUserRole,
          'X-Current-User-Id': currentUserId,
        },
      }
    ),
  remove: (id) => api.delete(`${URL}/${id}`),
};

export default userService;
