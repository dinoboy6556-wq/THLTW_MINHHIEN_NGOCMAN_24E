<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AdminCategoryController extends Controller
{
    /**
     * Xem danh sách danh mục (Tìm kiếm, Phân trang)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->with('parent');

        // Tìm kiếm theo tên
        if ($request->filled('keyword')) {
            $query->where('name', 'LIKE', '%' . $request->keyword . '%');
        }

        // Lọc theo trạng thái (1: Hiện, 0: Ẩn)
        if ($request->has('status') && $request->status !== null) {
            $query->where('status', $request->status);
        }

        $categories = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $categories
        ], 200);
    }

    /**
     * Thêm danh mục mới
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:categories,name',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục thành công',
            'data' => $category
        ], 201);
    }

    /**
     * Xem chi tiết 1 danh mục
     */
    public function show(int $id): JsonResponse
    {
        $category = Category::with('parent')->find($id);

        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục'], 404);
        }

        return response()->json(['success' => true, 'data' => $category], 200);
    }

    /**
     * Cập nhật danh mục
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:categories,name,' . $id,
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data' => $category
        ], 200);
    }

    /**
     * Xóa danh mục (Kiểm tra ràng buộc dữ liệu)
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy danh mục'], 404);
        }

        // RÀNG BUỘC: Kiểm tra nếu danh mục còn sản phẩm thuộc về nó
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục!'
            ], 400);
        }

        // RÀNG BUỘC: Kiểm tra nếu danh mục đang có danh mục con
        if ($category->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục này vì đang chứa các danh mục con!'
            ], 400);
        }

        $category->delete();

        return response()->json(['success' => true, 'message' => 'Xóa danh mục thành công'], 200);
    }
}