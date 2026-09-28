<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm (Lọc, Tìm kiếm, Sắp xếp, Phân trang)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->active()
            ->with(['category:id,name,slug', 'brand:id,name,logo']);

        // 1. Tìm kiếm theo từ khóa (Tên hoặc Mô tả)
        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'LIKE', "%{$keyword}%")
                    ->orWhere('description', 'LIKE', "%{$keyword}%");
            });
        }

        // 2. Lọc theo Danh mục (category_id hoặc category_slug)
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // 3. Lọc theo Thương hiệu
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        // 4. Lọc theo Khoảng giá
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // 5. Sắp xếp
        switch ($request->input('sort_by')) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'latest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // 6. Phân trang (Mặc định 12 sản phẩm/trang)
        $perPage = $request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data' => ProductResource::collection($products),
            'pagination' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ]
        ], 200);
    }

    /**
     * Lấy chi tiết một sản phẩm theo slug (FUNC-PROD-03)
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(['category', 'brand', 'images'])
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại hoặc đã bị ẩn'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết sản phẩm thành công',
            'data' => new ProductResource($product)
        ], 200);
    }
}
