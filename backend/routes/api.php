<?php

use Illuminate\Support\Facades\Route;

// Controllers Public & Frontend
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderHistoryController;

// Controllers Admin & Auth
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\PostController;



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
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// API Đăng nhập
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);


/*
|--------------------------------------------------------------------------
| 2. AUTHENTICATED ROUTES (Dành cho MỌI USER đã đăng nhập: Member & Admin)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/my-orders', [OrderHistoryController::class, 'index']);
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
    Route::apiResource('posts', \App\Http\Controllers\Api\Admin\AdminPostController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

// 1. Route Khách hàng (Đặt hàng từ Giỏ hàng)
Route::middleware('auth:sanctum')->post('/orders', [CheckoutController::class, 'store']);

// 2. Route Quản trị viên (Admin Quản lý Đơn hàng)
Route::prefix('admin')->name('admin.')->group(function () {
    // Tạm thời mở route Quản lý đơn hàng (Lấy danh sách, cập nhật trạng thái, xóa)
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [AdminOrderController::class, 'destroy']);
});

Route::prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}/block', [UserController::class, 'toggleBlock']);
});

// 1. ROUTE PUBLIC (Dành cho Trang chủ & Khách mua hàng - Không bị chặn 403)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);

// 2. ROUTE ADMIN (Chỉ dành cho trang Quản trị /admin)
Route::prefix('admin')->middleware(['auth:sanctum', 'check.admin'])->group(function () {
    // Các thao tác Thêm, Sửa, Xóa của Admin nằm ở đây
});

Route::prefix('admin')->group(function () {
    // Quản lý người dùng
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}/block', [UserController::class, 'toggleBlock']);

    // Quản lý Sản phẩm, Danh mục, Thương hiệu cho Admin
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/brands', [BrandController::class, 'index']);
});
