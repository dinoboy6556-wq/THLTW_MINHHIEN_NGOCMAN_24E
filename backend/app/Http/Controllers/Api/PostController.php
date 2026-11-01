<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = Post::published()->orderByDesc('published_at')->get();
        $posts->transform(fn (Post $post) => $this->addCoverImageUrl($post));

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = Post::published()->where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->addCoverImageUrl($post),
        ]);
    }

    private function addCoverImageUrl(Post $post): Post
    {
        $coverImage = $post->cover_image;
        if ($coverImage && !Str::startsWith($coverImage, ['http://', 'https://'])) {
            $path = ltrim($coverImage, '/');
            $url = Str::startsWith($path, 'storage/') ? '/' . $path : Storage::disk('public')->url($path);
            $post->setAttribute('cover_image', asset($url));
        }
        return $post;
    }
}
