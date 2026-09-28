<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AdminProductController extends Controller
{
    /**
     * Danh sách sản phẩm (Tìm kiếm, Lọc Danh mục, Lọc Thương hiệu, Lọc Trạng thái)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['category', 'brand']);

        if ($request->filled('keyword')) {
            $query->where('name', 'LIKE', '%' . $request->keyword . '%');
        }

        if ($request->filled('cate_id')) {
            $query->where('cate_id', $request->cate_id);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status);
        }

        $products = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 10));

        return response()->json(['success' => true, 'data' => $products], 200);
    }

    /**
     * Thêm mới sản phẩm
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:200|unique:products,name',
            'cate_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'promo_price' => 'nullable|numeric|min:0|lte:price', // Giá KM phải nhỏ hơn hoặc bằng giá gốc
            'stock' => 'required|integer|min:0',
            'thumbnail' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'cate_id' => $request->cate_id,
            'brand_id' => $request->brand_id,
            'price' => $request->price,
            'promo_price' => $request->promo_price,
            'stock' => $request->stock,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'message' => 'Thêm sản phẩm thành công', 'data' => $product], 201);
    }

    /**
     * Chi tiết sản phẩm
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'brand'])->find($id);
        if (!$product)
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
        return response()->json(['success' => true, 'data' => $product], 200);
    }

    /**
     * Cập nhật sản phẩm
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product)
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:200|unique:products,name,' . $id,
            'cate_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'promo_price' => 'nullable|numeric|min:0|lte:price',
            'stock' => 'required|integer|min:0',
            'thumbnail' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'cate_id' => $request->cate_id,
            'brand_id' => $request->brand_id,
            'price' => $request->price,
            'promo_price' => $request->promo_price,
            'stock' => $request->stock,
            'thumbnail' => $request->thumbnail,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật sản phẩm thành công', 'data' => $product], 200);
    }

    /**
     * Xóa sản phẩm
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product)
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);

        // (Sau này sẽ bổ sung RÀNG BUỘC: Không xóa sản phẩm đã có trong Đơn hàng)

        $product->delete();
        return response()->json(['success' => true, 'message' => 'Xóa sản phẩm thành công'], 200);
    }
}