<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductReactionController extends Controller
{
    public function show(Request $request, Product $product): JsonResponse
    {
        $reactions = $product->reactions();
        $userId = $request->user('sanctum')?->getAuthIdentifier();

        return response()->json([
            'success' => true,
            'data' => [
                'likes' => (clone $reactions)->where('reaction', 'like')->count(),
                'dislikes' => (clone $reactions)->where('reaction', 'dislike')->count(),
                'my_reaction' => $userId
                    ? (clone $reactions)->where('user_id', $userId)->value('reaction')
                    : null,
                'is_favorite' => $userId
                    ? $request->user('sanctum')->favoriteProducts()->where('product_id', $product->id)->exists()
                    : false,
            ],
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'reaction' => ['nullable', Rule::in(['like', 'dislike'])],
        ]);

        $user = $request->user();
        $reaction = $validated['reaction'] ?? null;

        if ($reaction === null) {
            $user->productReactions()->where('product_id', $product->id)->delete();
        } else {
            $user->productReactions()->updateOrCreate(
                ['product_id' => $product->id],
                ['reaction' => $reaction],
            );
        }

        return $this->show($request, $product);
    }
}
