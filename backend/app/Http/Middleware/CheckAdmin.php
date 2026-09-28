<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdmin
{
    public function handle(Request $request, Closure $next)
    {
        // Kiểm tra xem đã đăng nhập và role có phải 'admin' hay không
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Quyền truy cập bị từ chối! Chỉ Admin mới có quyền thực hiện thao tác này.'
            ], 403); // 403 Forbidden
        }

        return $next($request);
    }
}