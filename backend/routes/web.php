<?php

use App\Http\Controllers\AdminController;

Route::get('/admin', function () {
    // Hoặc trả về một view giao diện admin, ví dụ: return view('admin.dashboard');
    return "Trang Quản Trị (Admin Panel)";
});
