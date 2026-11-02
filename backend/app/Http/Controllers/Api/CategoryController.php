<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::active();

        // Public listing/filter pages need every active category, including
        // child categories. Keep the existing tree response for the homepage.
        if ($request->boolean('flat')) {
            $categories = $query
                ->with('parent:id,name')
                ->orderByRaw('parent_id IS NOT NULL')
                ->orderBy('name')
                ->get();
        } else {
            $categories = $query
                ->parentsOnly()
                ->with([
                    'children' => function ($query) {
                        $query->active();
                    }
                ])
                ->get();
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => CategoryResource::collection($categories)
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::active()
            ->with(['children' => function ($query) {
                $query->active();
            }])
            ->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Danh mục không tồn tại hoặc đã bị ẩn',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết danh mục thành công',
            'data' => new CategoryResource($category),
        ], 200);
    }
}
