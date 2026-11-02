<?php

use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminMenuController;
use App\Http\Controllers\Api\Admin\AdminPostController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminTrashController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminOrderRequestController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\ExtraManagementController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderHistoryController;
use App\Http\Controllers\Api\OrderRequestController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\ProductFavoriteController;
use App\Http\Controllers\Api\ProductReactionController;
use App\Http\Controllers\Api\VnpayController;
use App\Http\Middleware\CheckAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{slug}', [BrandController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}/reactions', [ProductReactionController::class, 'show']);
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index']);
Route::post('/coupons/validate', [CouponController::class, 'validateCode']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);
Route::get('/menus', [MenuController::class, 'index']);
Route::post('/chat', ChatController::class)->middleware('throttle:20,1');
Route::post('/contacts', [ExtraManagementController::class, 'submitContact']);
Route::get('/pages/{slug}', [ExtraManagementController::class, 'publicPage']);
Route::get('/banners', fn () => response()->json(['success'=>true,'data'=>\Illuminate\Support\Facades\DB::table('banners')->where('is_active',true)->orderBy('sort_order')->get()]));
Route::get('/settings', fn () => response()->json(['success'=>true,'data'=>\Illuminate\Support\Facades\DB::table('website_settings')->pluck('value','key')]));
Route::get('/payments/vnpay/return', [VnpayController::class, 'returnFromGateway']);
Route::get('/payments/vnpay/ipn', [VnpayController::class, 'ipn']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/my-orders', [OrderHistoryController::class, 'index']);
    Route::get('/my-order-requests', [OrderRequestController::class, 'index']);
    Route::post('/my-orders/{orderId}/requests', [OrderRequestController::class, 'store']);
    Route::get('/favorites', [ProductFavoriteController::class, 'index']);
    Route::put('/products/{product}/favorite', [ProductFavoriteController::class, 'store']);
    Route::delete('/products/{product}/favorite', [ProductFavoriteController::class, 'destroy']);
    Route::put('/products/{product}/reaction', [ProductReactionController::class, 'update']);
    Route::post('/orders', [CheckoutController::class, 'store']);
    Route::post('/products/{product}/reviews', [ProductReviewController::class, 'store']);
});

Route::middleware(['auth:sanctum', CheckAdmin::class])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/coupons', [AdminCouponController::class, 'index']);
    Route::post('/coupons', [AdminCouponController::class, 'store']);
    Route::put('/coupons/{coupon}', [AdminCouponController::class, 'update']);
    Route::delete('/coupons/{coupon}', [AdminCouponController::class, 'destroy']);
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::put('/reviews/{review}', [AdminReviewController::class, 'update']);
    Route::get('/order-requests', [AdminOrderRequestController::class, 'index']);
    Route::put('/order-requests/{id}', [AdminOrderRequestController::class, 'update']);
    Route::get('/inventory/movements', [ExtraManagementController::class, 'stockMovements']);
    Route::post('/inventory/movements', [ExtraManagementController::class, 'moveStock']);
    Route::get('/contacts', [ExtraManagementController::class, 'index'])->defaults('resource', 'contacts');
    Route::put('/contacts/{id}', [ExtraManagementController::class, 'replyContact']);
    foreach (['pages','banners','post-categories','settings'] as $resource) {
        Route::get("/{$resource}", [ExtraManagementController::class, 'index'])->defaults('resource', $resource);
        Route::post("/{$resource}", [ExtraManagementController::class, 'store'])->defaults('resource', $resource);
        Route::put("/{$resource}/{id}", [ExtraManagementController::class, 'update'])->defaults('resource', $resource);
        Route::delete("/{$resource}/{id}", [ExtraManagementController::class, 'destroy'])->defaults('resource', $resource);
    }
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
