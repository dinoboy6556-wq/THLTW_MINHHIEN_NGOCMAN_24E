<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::parentsOnly()
            ->active()
            ->with([
                'children' => function ($query) {
                    $query->active();
                }
            ])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => CategoryResource::collection($categories)
        ], 200);
    }
}