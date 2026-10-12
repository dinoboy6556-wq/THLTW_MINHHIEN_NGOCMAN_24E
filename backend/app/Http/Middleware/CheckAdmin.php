<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdmin
{
    public function handle(Request $request, Closure $next)
    {
        // Kiểm tra đã đăng nhập và role thuộc nhóm Quản trị ('admin' hoặc 'super_admin')
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Quyền truy cập bị từ chối! Chỉ Quản trị viên mới có quyền thực hiện thao tác này.'
            ], 403); // 403 Forbidden
        }

        return $next($request);
    }
}