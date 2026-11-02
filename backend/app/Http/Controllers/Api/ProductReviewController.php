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
            ->where('status', 'approved')
            ->with('user:id,username')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
            'summary' => [
                'average' => round((float) $product->reviews()->where('status', 'approved')->avg('rating'), 1),
                'count' => $product->reviews()->where('status', 'approved')->count(),
            ],
        ]);
    }

    public function store(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $existingReview = ProductReview::query()
            ->where('product_id', $product->id)
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->first();

        $imagePath = $request->file('image')?->store('reviews', 'public')
            ?? $existingReview?->image_path;

        $review = ProductReview::updateOrCreate(
            [
                'product_id' => $product->id,
                'user_id' => $request->user()->getAuthIdentifier(),
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'image_path' => $imagePath,
                'status' => 'pending',
            ]
        );

        $review->load('user:id,username');

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá đã được gửi và đang chờ quản trị viên duyệt.',
            'data' => $review,
        ], $review->wasRecentlyCreated ? 201 : 200);
    }
}
