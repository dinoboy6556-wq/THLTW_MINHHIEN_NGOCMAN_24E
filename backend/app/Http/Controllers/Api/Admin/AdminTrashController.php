<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminTrashController extends Controller
{
    /**
     * @var array<string, class-string<Model>>
     */
    private const RESOURCES = [
        'products' => Product::class,
        'categories' => Category::class,
        'brands' => Brand::class,
        'posts' => Post::class,
        'orders' => Order::class,
        'users' => User::class,
        'menu_items' => MenuItem::class,
    ];

    /**
     * @var array<string, string>
     */
    private const RESOURCE_LABELS = [
        'products' => 'Sản phẩm',
        'categories' => 'Danh mục',
        'brands' => 'Thương hiệu',
        'posts' => 'Bài viết',
        'orders' => 'Đơn hàng',
        'users' => 'Người dùng',
        'menu_items' => 'Menu',
    ];

    public function index(Request $request): JsonResponse
    {
        $items = collect();

        foreach (self::RESOURCES as $resource => $modelClass) {
            $query = $modelClass::onlyTrashed();
            if ($resource === 'users') {
                $query->where('role', '!=', 'super_admin');
                if ($request->user()->role !== 'super_admin') {
                    $query->where('role', 'member');
                }
            }

            $trashedItems = $query->orderByDesc('deleted_at')->get();

            foreach ($trashedItems as $item) {
                $items->push([
                    'id' => $item->getKey(),
                    'resource' => $resource,
                    'resource_label' => self::RESOURCE_LABELS[$resource],
                    'label' => $this->itemLabel($resource, $item),
                    'details' => $this->itemDetails($resource, $item),
                    'deleted_at' => $item->deleted_at?->toIso8601String(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $items->sortByDesc('deleted_at')->values(),
        ]);
    }

    public function restore(Request $request, string $resource, int $id): JsonResponse
    {
        $modelClass = $this->modelFor($resource);
        $item = $modelClass::onlyTrashed()->find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mục trong thùng rác.',
            ], 404);
        }

        $blockedMessage = $this->userRoleBlockMessage($request, $resource, $item);
        if ($blockedMessage !== null) {
            return response()->json(['success' => false, 'message' => $blockedMessage], 403);
        }

        $item->restore();

        return response()->json([
            'success' => true,
            'message' => 'Đã khôi phục mục thành công.',
        ]);
    }

    public function destroy(Request $request, string $resource, int $id): JsonResponse
    {
        $modelClass = $this->modelFor($resource);
        $item = $modelClass::onlyTrashed()->find($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mục trong thùng rác.',
            ], 404);
        }

        $roleBlockedMessage = $this->userRoleBlockMessage($request, $resource, $item);
        if ($roleBlockedMessage !== null) {
            return response()->json(['success' => false, 'message' => $roleBlockedMessage], 403);
        }

        $blockedMessage = $this->permanentDeleteBlockMessage($resource, $item);
        if ($blockedMessage !== null) {
            return response()->json([
                'success' => false,
                'message' => $blockedMessage,
            ], 409);
        }

        if ($resource === 'posts' && Str::startsWith($item->cover_image ?? '', 'posts/')) {
            Storage::disk('public')->delete($item->cover_image);
        }

        $item->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa vĩnh viễn mục thành công.',
        ]);
    }

    /** @return class-string<Model> */
    private function modelFor(string $resource): string
    {
        abort_unless(isset(self::RESOURCES[$resource]), 404, 'Loại dữ liệu không hợp lệ.');

        return self::RESOURCES[$resource];
    }

    private function itemLabel(string $resource, Model $item): string
    {
        return match ($resource) {
            'products', 'categories', 'brands' => (string) $item->name,
            'posts' => (string) $item->title,
            'orders' => (string) ($item->order_code ?: 'Đơn hàng #' . $item->getKey()),
            'users' => (string) $item->username,
            'menu_items' => (string) $item->label,
        };
    }

    private function itemDetails(string $resource, Model $item): ?string
    {
        return match ($resource) {
            'products' => 'Giá: ' . number_format((float) $item->price, 0, ',', '.') . ' đ',
            'categories', 'brands' => $item->description,
            'posts' => (string) $item->category,
            'orders' => (string) $item->cus_name,
            'users' => (string) $item->email,
            'menu_items' => 'Đường dẫn: ' . $item->url,
        };
    }

    private function userRoleBlockMessage(Request $request, string $resource, Model $item): ?string
    {
        if ($resource !== 'users' || !$item instanceof User) {
            return null;
        }

        if ($item->role === 'super_admin') {
            return 'Không thể thao tác với tài khoản Super Admin trong thùng rác.';
        }

        if ($request->user()->role !== 'super_admin' && $item->role !== 'member') {
            return 'Admin thường chỉ có quyền khôi phục hoặc xóa tài khoản Member.';
        }

        return null;
    }

    private function permanentDeleteBlockMessage(string $resource, Model $item): ?string
    {
        if ($resource === 'categories') {
            if (Product::withTrashed()->where('cate_id', $item->getKey())->exists()) {
                return 'Không thể xóa vĩnh viễn danh mục đang được sản phẩm sử dụng.';
            }

            if (Category::withTrashed()->where('parent_id', $item->getKey())->exists()) {
                return 'Không thể xóa vĩnh viễn danh mục đang có danh mục con.';
            }
        }

        if ($resource === 'brands' && Product::withTrashed()->where('brand_id', $item->getKey())->exists()) {
            return 'Không thể xóa vĩnh viễn thương hiệu đang được sản phẩm sử dụng.';
        }

        if ($resource === 'products') {
            if (OrderItem::where('product_id', $item->getKey())->exists()) {
                return 'Không thể xóa vĩnh viễn sản phẩm đã xuất hiện trong đơn hàng.';
            }

            if (ProductReview::where('product_id', $item->getKey())->exists()) {
                return 'Không thể xóa vĩnh viễn sản phẩm đang có đánh giá.';
            }
        }

        if ($resource === 'users') {
            if (Order::withTrashed()->where('user_id', $item->getKey())->exists()) {
                return 'Không thể xóa vĩnh viễn người dùng có lịch sử đơn hàng.';
            }

            if (ProductReview::where('user_id', $item->getKey())->exists()) {
                return 'Không thể xóa vĩnh viễn người dùng đang có đánh giá.';
            }
        }

        return null;
    }
}
