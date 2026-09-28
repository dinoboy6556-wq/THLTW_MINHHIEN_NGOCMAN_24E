<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BrandController;


// API Danh mục
Route::get('/categories', [CategoryController::class, 'index']);

// API Sản phẩm
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']); // Xem chi tiết sản phẩm
// API Thương hiệu
Route::get('/brands', [BrandController::class, 'index']); // Lấy danh sách tất cả thương hiệu
Route::get('/brands/{slug}', [BrandController::class, 'show']); // Lấy chi tiết thương hiệu kèm danh sách sản phẩm
