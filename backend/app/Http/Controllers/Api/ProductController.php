<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
        $query = Product::active()->with(['category', 'brand']);
        $product = ctype_digit($slug)
            ? $query->whereKey((int) $slug)->first()
            : $query->where('slug', $slug)->first();

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

    /**
     * Thêm mới sản phẩm (Dành cho trang Admin)
     */
    /**
     * Thêm mới sản phẩm (Dành cho trang Admin)
     */
    public function store(Request $request): JsonResponse
    {
        // Tự động map các key từ frontend (có thể là camelCase như categoryId) sang snake_case
        $request->merge([
            'category_id' => $request->input('category_id') ?? $request->input('categoryId') ?? $request->input('category'),
            'brand_id' => $request->input('brand_id') ?? $request->input('brandId') ?? $request->input('brand'),
            'price_sale' => $request->input('price_sale') ?? $request->input('priceSale'),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'price' => 'required|numeric',
            'price_sale' => 'nullable|numeric',
            'quantity' => 'required|integer',
            'thumbnail' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|integer',
        ]);

        // Tự động tạo slug nếu chưa có
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm sản phẩm thành công!',
            'data' => new ProductResource($product)
        ], 201);
    }
}
