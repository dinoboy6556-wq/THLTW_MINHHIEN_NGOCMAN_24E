<?php

use Illuminate\Support\Facades\Route;

// Controllers Public & Frontend
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;

// Controllers Admin & Auth
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\OrderController;

// Middleware
use App\Http\Middleware\CheckAdmin;

/*
|--------------------------------------------------------------------------
| 1. PUBLIC ROUTES (Không cần đăng nhập)
|--------------------------------------------------------------------------
*/

// API Danh mục
Route::get('/categories', [CategoryController::class, 'index']);

// API Thương hiệu
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{slug}', [BrandController::class, 'show']);

// API Sản phẩm
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// API Giỏ hàng (Hỗ trợ cả Guest dùng session_id và User đăng nhập)
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'store']);
    Route::put('/items/{id}', [CartController::class, 'update']);
    Route::delete('/items/{id}', [CartController::class, 'destroy']);
});

// API Đăng nhập
Route::post('/login', [AuthController::class, 'login'])->name('login');


/*
|--------------------------------------------------------------------------
| 2. AUTHENTICATED ROUTES (Dành cho MỌI USER đã đăng nhập: Member & Admin)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});


/*
|--------------------------------------------------------------------------
| 3. ADMIN ROUTES (CHỈ ADMIN mới truy cập được)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', CheckAdmin::class])->prefix('admin')->group(function () {
    // Quản lý Danh mục (FUNC-ADM-CATE-01..04)
    Route::apiResource('categories', AdminCategoryController::class);

    // Quản lý Thương hiệu (FUNC-ADM-BRAND-01..04)
    Route::apiResource('brands', AdminBrandController::class);

    // Quản lý Sản phẩm (FUNC-ADM-PROD-01..04)
    Route::apiResource('products', AdminProductController::class);
});

// 1. Route Khách hàng (Đặt hàng từ Giỏ hàng)
Route::post('/orders', [OrderController::class, 'store']);

// 2. Route Quản trị viên (Admin Quản lý Đơn hàng)
Route::prefix('admin')->name('admin.')->group(function () {
    // Tạm thời mở route Quản lý đơn hàng (Lấy danh sách, cập nhật trạng thái, xóa)
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [AdminOrderController::class, 'destroy']);
});