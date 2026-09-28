<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AdminBrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Brand::query();

        if ($request->filled('keyword')) {
            $query->where('name', 'LIKE', '%' . $request->keyword . '%');
        }

        $brands = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 10));

        return response()->json(['success' => true, 'data' => $brands], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:brands,name',
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $brand = Brand::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'logo' => $request->logo,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'message' => 'Thêm thương hiệu thành công', 'data' => $brand], 201);
    }

    public function show(int $id): JsonResponse
    {
        $brand = Brand::find($id);
        if (!$brand)
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thương hiệu'], 404);
        return response()->json(['success' => true, 'data' => $brand], 200);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $brand = Brand::find($id);
        if (!$brand)
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thương hiệu'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:brands,name,' . $id,
            'logo' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $brand->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'logo' => $request->logo,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật thương hiệu thành công', 'data' => $brand], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $brand = Brand::find($id);
        if (!$brand)
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thương hiệu'], 404);

        // RÀNG BUỘC: Kiểm tra nếu thương hiệu có sản phẩm
        if ($brand->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa thương hiệu này vì đang có sản phẩm thuộc về nó!'
            ], 400);
        }

        $brand->delete();
        return response()->json(['success' => true, 'message' => 'Xóa thương hiệu thành công'], 200);
    }
}