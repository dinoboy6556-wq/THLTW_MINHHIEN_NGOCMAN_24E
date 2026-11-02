<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

        $posts = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 10));
        $posts->getCollection()->transform(function (Post $post) {
            $post->setAttribute('cover_image', $this->coverImageUrl($post->cover_image));
            return $post;
        });

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'excerpt' => ['required', 'string', 'max:1000'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'cover_image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'status' => ['required', Rule::in([0, 1])],
        ]);

        if ($request->hasFile('cover_image_file')) {
            $validated['cover_image'] = $request->file('cover_image_file')->store('posts', 'public');
        }
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['status'] = (int) $validated['status'];
        $validated['published_at'] = $validated['status'] === 1 ? now() : null;

        $post = Post::create($validated);
        $post->setAttribute('cover_image', $this->coverImageUrl($post->cover_image));

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
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'cover_image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'status' => ['required', Rule::in([0, 1])],
        ]);

        $previousCoverImage = $post->cover_image;
        if ($request->hasFile('cover_image_file')) {
            $validated['cover_image'] = $request->file('cover_image_file')->store('posts', 'public');
        } elseif (!array_key_exists('cover_image', $validated)) {
            unset($validated['cover_image']);
        }

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

        if (
            $request->hasFile('cover_image_file') &&
            Str::startsWith($previousCoverImage ?? '', 'posts/') &&
            Storage::disk('public')->exists($previousCoverImage)
        ) {
            Storage::disk('public')->delete($previousCoverImage);
        }

        $post->refresh();
        $post->setAttribute('cover_image', $this->coverImageUrl($post->cover_image));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài viết thành công',
            'data' => $post,
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

    private function coverImageUrl(?string $coverImage): ?string
    {
        if (!$coverImage) {
            return null;
        }
        if (Str::startsWith($coverImage, ['http://', 'https://'])) {
            return $coverImage;
        }

        $path = ltrim($coverImage, '/');
        $url = Str::startsWith($path, 'storage/') ? '/' . $path : Storage::disk('public')->url($path);
        return asset($url);
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
