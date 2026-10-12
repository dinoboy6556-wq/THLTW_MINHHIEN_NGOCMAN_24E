<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // 1. Lấy danh sách tất cả người dùng
    public function index()
    {
        try {
            $users = User::latest()->get();
            return response()->json($users, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi tải danh sách người dùng: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. Lấy chi tiết người dùng kèm danh sách đơn hàng đã đặt
    public function show($id)
    {
        try {
            $user = User::with(['orders.items'])->find($id);

            if (!$user) {
                return response()->json(['message' => 'Không tìm thấy người dùng!'], 404);
            }

            return response()->json($user, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy chi tiết người dùng: ' . $e->getMessage()
            ], 500);
        }
    }

    // 3. Khóa / Mở khóa người dùng
    public function toggleBlock(Request $request, $id)
    {
        try {
            $targetUser = User::find($id);

            if (!$targetUser) {
                return response()->json(['message' => 'Không tìm thấy người dùng!'], 404);
            }

            // Ưu tiên đọc từ Token Sanctum nếu đã đăng nhập, hoặc fallback từ Header do Frontend truyền lên
            $authUser = $request->user();
            $currentUserRole = $authUser ? $authUser->role : $request->header('X-Current-User-Role', $request->input('current_user_role', 'admin'));
            $currentUserId = $authUser ? $authUser->id : $request->header('X-Current-User-Id', $request->input('current_user_id'));

            // Không cho phép tự khóa chính mình
            if ($currentUserId && (int) $currentUserId === (int) $targetUser->id) {
                return response()->json(['message' => 'Bạn không thể tự khóa tài khoản của chính mình!'], 403);
            }

            // Không ai được phép khóa Super Admin
            if ($targetUser->role === 'super_admin') {
                return response()->json(['message' => 'Không thể khóa tài khoản Super Admin!'], 403);
            }

            // Admin thường chỉ được khóa member, không được khóa admin khác
            if ($currentUserRole !== 'super_admin' && in_array($targetUser->role, ['admin', 'super_admin'])) {
                return response()->json(['message' => 'Admin thường chỉ có quyền khóa tài khoản Member!'], 403);
            }

            // Thực hiện đổi trạng thái (1: Hoạt động <-> 0: Bị khóa)
            $targetUser->status = $targetUser->status == 1 ? 0 : 1;
            $targetUser->save();

            $actionText = $targetUser->status == 1 ? 'Mở khóa' : 'Khóa';

            return response()->json([
                'message' => "Đã {$actionText} tài khoản {$targetUser->username} thành công!",
                'data' => $targetUser,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi thay đổi trạng thái tài khoản: ' . $e->getMessage()
            ], 500);
        }
    }
}