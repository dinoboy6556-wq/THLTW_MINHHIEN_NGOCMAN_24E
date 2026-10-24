<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::query();

        if ($request->filled('keyword')) {
            $keyword = $request->string('keyword')->toString();
            $query->where(function ($query) use ($keyword) {
                $query->where('title', 'LIKE', "%{$keyword}%")
                    ->orWhere('category', 'LIKE', "%{$keyword}%");
            });
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('created_at')
                ->paginate($request->integer('per_page', 10)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'excerpt' => ['required', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'url', 'max:2048'],
            'status' => ['required', Rule::in([0, 1])],
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['status'] = (int) $validated['status'];
        $validated['published_at'] = $validated['status'] === 1 ? now() : null;

        $post = Post::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm bài viết thành công',
            'data' => $post,
        ], 201);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'excerpt' => ['required', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'url', 'max:2048'],
            'status' => ['required', Rule::in([0, 1])],
        ]);

        $validated['status'] = (int) $validated['status'];

        if ($validated['title'] !== $post->title) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $post->id);
        }

        if ($validated['status'] === 1 && $post->published_at === null) {
            $validated['published_at'] = now();
        } elseif ($validated['status'] === 0) {
            $validated['published_at'] = null;
        }

        $post->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài viết thành công',
            'data' => $post->refresh(),
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa bài viết thành công',
        ]);
    }

    private function uniqueSlug(string $title, ?int $exceptId = null): string
    {
        $baseSlug = Str::slug($title) ?: 'bai-viet';
        $slug = $baseSlug;
        $suffix = 2;

        while (Post::query()
            ->where('slug', $slug)
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
