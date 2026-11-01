<?php

use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminMenuController;
use App\Http\Controllers\Api\Admin\AdminPostController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminTrashController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\OrderHistoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\VnpayController;
use App\Http\Middleware\CheckAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{slug}', [BrandController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);
Route::get('/menus', [MenuController::class, 'index']);
Route::post('/chat', ChatController::class)->middleware('throttle:20,1');
Route::get('/payments/vnpay/return', [VnpayController::class, 'returnFromGateway']);
Route::get('/payments/vnpay/ipn', [VnpayController::class, 'ipn']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/my-orders', [OrderHistoryController::class, 'index']);
    Route::post('/orders', [CheckoutController::class, 'store']);
    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);
});

Route::middleware(['auth:sanctum', CheckAdmin::class])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/trash', [AdminTrashController::class, 'index']);
    Route::post('/trash/{resource}/{id}/restore', [AdminTrashController::class, 'restore']);
    Route::delete('/trash/{resource}/{id}', [AdminTrashController::class, 'destroy']);

    Route::apiResource('categories', AdminCategoryController::class);
    Route::apiResource('menus', AdminMenuController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('brands', AdminBrandController::class);
    Route::apiResource('products', AdminProductController::class);
    Route::apiResource('posts', AdminPostController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [AdminOrderController::class, 'destroy']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::put('/users/{id}/block', [UserController::class, 'toggleBlock']);
});
