<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function index(Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->with('user:id,username')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
            'summary' => [
                'average' => round((float) $product->reviews()->avg('rating'), 1),
                'count' => $product->reviews()->count(),
            ],
        ]);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'max:1000'],
        ]);

        $review = ProductReview::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id' => $request->user()->getAuthIdentifier(),
            ],
            $validated
        );

        $review->load('user:id,username');

        return response()->json([
            'success' => true,
            'message' => 'Gửi đánh giá thành công.',
            'data' => $review,
        ], $review->wasRecentlyCreated ? 201 : 200);
    }
}
