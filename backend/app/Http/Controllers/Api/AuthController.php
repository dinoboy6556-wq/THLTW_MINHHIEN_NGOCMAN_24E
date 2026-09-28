<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * API Đăng Nhập (Cấp Bearer Token)
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string', // Nhận email hoặc username
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Tìm người dùng theo email hoặc username
        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        // Kiểm tra tài khoản và mật khẩu (Khớp với cột 'pass' trong DB của bạn)
        if (!$user || !Hash::check($request->password, $user->pass)) {
            return response()->json([
                'success' => false,
                'message' => 'Thông tin đăng nhập hoặc mật khẩu không đúng!'
            ], 401);
        }

        // Kiểm tra tài khoản có bị khóa không
        if ($user->status != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn hiện đang bị khóa!'
            ], 403);
        }

        // Tạo Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role, // 'admin' hoặc 'member'
            ]
        ], 200);
    }

    /**
     * API Đăng Xuất (Hủy Token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ], 200);
    }

    /**
     * Lấy thông tin tài khoản đang đăng nhập
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ], 200);
    }
}