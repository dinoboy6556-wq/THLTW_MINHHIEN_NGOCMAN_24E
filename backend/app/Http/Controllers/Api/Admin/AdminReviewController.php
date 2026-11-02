<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProductReview::query()->with(['product:id,name,slug', 'user:id,username,email']);

        if ($request->filled('status') && in_array($request->input('status'), ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $request->input('status'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate($request->integer('per_page', 20)),
        ]);
    }

    public function update(Request $request, ProductReview $review): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $review->update($validated);
        return response()->json(['success' => true, 'data' => $review->fresh(['product', 'user'])]);
    }
}
