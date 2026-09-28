<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminProductController;


// API Danh mục
Route::get('/categories', [CategoryController::class, 'index']);

// API Sản phẩm
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']); // Xem chi tiết sản phẩm
// API Thương hiệu
Route::get('/brands', [BrandController::class, 'index']); // Lấy danh sách tất cả thương hiệu
Route::get('/brands/{slug}', [BrandController::class, 'show']); // Lấy chi tiết thương hiệu kèm danh sách sản phẩm

// Cụm API Quản trị (Admin)
Route::prefix('admin')->group(function () {
    // 1. Quản lý Danh mục (FUNC-ADM-CATE-01..04)
    Route::apiResource('categories', AdminCategoryController::class);

    // 2. Quản lý Thương hiệu (FUNC-ADM-BRAND-01..04)
    Route::apiResource('brands', AdminBrandController::class);

    // 3. Quản lý Sản phẩm (FUNC-ADM-PROD-01..04)
    Route::apiResource('products', AdminProductController::class);
});