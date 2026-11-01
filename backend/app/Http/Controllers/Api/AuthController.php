<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:user,username',
            'email' => 'required|email|max:100|unique:user,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'pass' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'role' => 'member',
            'status' => 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công.',
            'access_token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar_url' => $this->avatarUrl($user),
                'role' => $user->role,
            ],
        ], 201);
    }

    /**
     * API Đăng nhập
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Tìm người dùng theo email hoặc username
        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Thông tin đăng nhập hoặc mật khẩu không đúng!'
            ], 401);
        }

        $isLegacyMd5Hash = preg_match('/\A[a-f0-9]{32}\z/i', $user->pass) === 1;

        try {
            $passwordMatches = $isLegacyMd5Hash
                ? hash_equals(strtolower($user->pass), md5($request->password))
                : Hash::check($request->password, $user->pass);
        } catch (\RuntimeException) {
            $passwordMatches = false;
        }

        if (!$passwordMatches) {
            return response()->json([
                'success' => false,
                'message' => 'Thông tin đăng nhập hoặc mật khẩu không đúng!'
            ], 401);
        }

        // Kiểm tra tài khoản bị khóa
        if ($user->status != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn hiện đang bị khóa!'
            ], 403);
        }

        if ($isLegacyMd5Hash) {
            $user->forceFill(['pass' => Hash::make($request->password)])->save();
        }

        // Tạo Token Sanctum mới
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
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar_url' => $this->avatarUrl($user),
                'role' => $user->role,
            ]
        ], 200);
    }

    /**
     * API Đăng xuất (Thu hồi Token hiện tại)
     */
    public function logout(Request $request): JsonResponse
    {
        // Xóa token đang thực hiện request này ra khỏi DB
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
            'user' => $this->profileData($request->user())
        ], 200);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', Rule::unique('user', 'username')->ignore($user->id)],
            'email' => ['required', 'email', 'max:100', Rule::unique('user', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $oldAvatar = $user->avatar;
        $avatarFile = $request->file('avatar');
        unset($validated['avatar']);

        $user->fill($validated);
        if ($avatarFile) {
            $user->avatar = $avatarFile->store('avatars', 'public');
        }
        $user->save();

        if ($avatarFile && $oldAvatar && Storage::disk('public')->exists($oldAvatar)) {
            Storage::disk('public')->delete($oldAvatar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công.',
            'user' => $this->profileData($user->fresh()),
        ]);
    }

    private function profileData(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'avatar_url' => $this->avatarUrl($user),
            'role' => $user->role,
        ];
    }

    private function avatarUrl(User $user): ?string
    {
        return $user->avatar ? Storage::disk('public')->url($user->avatar) : null;
    }
}
