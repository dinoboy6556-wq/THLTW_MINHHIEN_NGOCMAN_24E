<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductFavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()->favoriteProducts()
            ->with('product.category:id,name,slug', 'product.brand:id,name,logo')
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $favorites]);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $request->user()->favoriteProducts()->firstOrCreate(['product_id' => $product->id]);

        return response()->json(['success' => true, 'is_favorite' => true]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $request->user()->favoriteProducts()->where('product_id', $product->id)->delete();

        return response()->json(['success' => true, 'is_favorite' => false]);
    }
}
