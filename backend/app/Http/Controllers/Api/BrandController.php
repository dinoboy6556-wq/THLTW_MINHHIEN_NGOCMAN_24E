<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    /**
     * Lấy danh sách tất cả thương hiệu (kèm số lượng sản phẩm)
     */
    public function index(): JsonResponse
    {
        $brands = Brand::where('status', 1)
            ->withCount('products')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách thương hiệu thành công',
            'data' => BrandResource::collection($brands)
        ], 200);
    }

    /**
     * Lấy chi tiết một thương hiệu theo slug (kèm danh sách sản phẩm thuộc thương hiệu đó)
     */
    public function show(string $slug): JsonResponse
    {
        $brand = Brand::where('status', 1)
            ->where('slug', $slug)
            ->with(['products' => function ($query) {
                $query->where('status', 1)->latest();
            }])
            ->first();

        if (!$brand) {
            return response()->json([
                'success' => false,
                'message' => 'Thương hiệu không tồn tại hoặc đã bị ẩn'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết thương hiệu thành công',
            'data' => new BrandResource($brand)
        ], 200);
    }
}
