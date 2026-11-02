<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use App\Mail\OrderStatusMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CommerceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_log_in_and_locked_user_is_rejected(): void
    {
        $member = User::factory()->create(['email' => 'member@example.com', 'pass' => Hash::make('secret123')]);

        $this->postJson('/api/login', ['login' => $member->email, 'password' => 'secret123'])
            ->assertOk()->assertJsonPath('user.role', 'member');

        $member->update(['status' => 0]);
        $this->postJson('/api/login', ['login' => $member->email, 'password' => 'secret123'])
            ->assertForbidden();
    }

    public function test_checkout_applies_coupon_and_reduces_stock(): void
    {
        Mail::fake();
        [$member, $product] = $this->makeMemberAndProduct(stock: 5, price: 1000);
        $coupon = Coupon::create([
            'code' => 'SAVE10', 'discount_type' => 'percent', 'discount_value' => 10,
            'minimum_order_amount' => 0, 'usage_limit' => 1, 'used_count' => 0,
            'is_active' => true,
        ]);

        $this->actingAs($member, 'sanctum')->postJson('/api/orders', [
            'cus_name' => $member->username, 'cus_email' => $member->email,
            'cus_phone' => '0900000000', 'cus_address' => 'Ho Chi Minh City',
            'payment_method' => 'cod', 'coupon_code' => 'save10',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])->assertCreated()->assertJsonPath('data.discount_amount', 200);

        $this->assertSame(3, $product->fresh()->stock);
        $this->assertSame(1, $coupon->fresh()->used_count);
        $this->assertDatabaseHas('order', ['coupon_code' => 'SAVE10', 'discount_amount' => 200]);
        Mail::assertSent(OrderStatusMail::class, fn (OrderStatusMail $mail): bool =>
            $mail->order->cus_email === $member->email && str_contains($mail->eventLabel, 'tạo')
        );
    }

    public function test_admin_coupon_endpoints_require_admin_role(): void
    {
        [$member] = $this->makeMemberAndProduct();
        $this->actingAs($member, 'sanctum')->getJson('/api/admin/coupons')->assertForbidden();

        $admin = User::factory()->create(['role' => 'super_admin']);
        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/coupons', [
            'code' => 'WELCOME', 'discount_type' => 'fixed', 'discount_value' => 50000,
            'minimum_order_amount' => 100000, 'is_active' => true,
        ])->assertCreated()->assertJsonPath('data.code', 'WELCOME');
    }

    public function test_member_can_favorite_and_react_to_a_product(): void
    {
        [$member, $product] = $this->makeMemberAndProduct();
        $this->actingAs($member, 'sanctum')
            ->putJson("/api/products/{$product->id}/favorite")
            ->assertOk()->assertJsonPath('is_favorite', true);
        $this->putJson("/api/products/{$product->id}/reaction", ['reaction' => 'like'])
            ->assertOk()->assertJsonPath('data.my_reaction', 'like');
        $this->getJson('/api/favorites')->assertOk()->assertJsonPath('data.total', 1);
    }

    public function test_review_image_waits_for_admin_moderation(): void
    {
        Storage::fake('public');
        [$member, $product] = $this->makeMemberAndProduct();
        $this->actingAs($member, 'sanctum')->post("/api/products/{$product->id}/reviews", [
            'rating' => 5, 'comment' => 'Sản phẩm hoạt động tốt.',
            'image' => UploadedFile::fake()->image('review.jpg'),
        ])->assertCreated();

        $review = ProductReview::firstOrFail();
        $this->assertSame('pending', $review->status);
        $this->assertNotNull($review->image_path);
        $this->getJson("/api/products/{$product->id}/reviews")
            ->assertOk()->assertJsonPath('summary.count', 0);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/reviews/{$review->id}", [
            'status' => 'approved',
        ])->assertOk();

        $this->getJson("/api/products/{$product->id}/reviews")
            ->assertOk()->assertJsonPath('summary.count', 1)
            ->assertJsonPath('data.data.0.image_url', '/backend-storage/' . $review->image_path);
    }

    public function test_approved_cancel_request_restores_inventory_once(): void
    {
        Mail::fake();
        [$member, $product] = $this->makeMemberAndProduct(stock: 3);
        $order = $this->makeOrder($member, $product, 0, 2);
        $product->delete();

        $this->actingAs($member, 'sanctum')->postJson("/api/my-orders/{$order->id}/requests", [
            'type' => 'cancel', 'reason' => 'Tôi muốn đổi địa chỉ giao hàng.',
        ])->assertCreated();
        $requestId = (int) $order->requests()->value('id');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/order-requests/{$requestId}", [
            'status' => 'approved',
        ])->assertOk();

        Mail::assertSent(OrderStatusMail::class);

        $this->assertSame(3, (int) DB::table('products')->where('id', $product->id)->value('stock'));
        $this->putJson("/api/admin/order-requests/{$requestId}", ['status' => 'approved'])
            ->assertUnprocessable();
        $this->assertSame(3, (int) DB::table('products')->where('id', $product->id)->value('stock'));
    }

    public function test_vnpay_failed_payment_cancels_order_and_restores_inventory(): void
    {
        Mail::fake();
        [$member, $product] = $this->makeMemberAndProduct(stock: 2);
        $order = $this->makeOrder($member, $product, 0, 1, 'vnpay');
        config(['services.vnpay.hash_secret' => 'test-secret', 'services.vnpay.frontend_url' => 'http://localhost:3000']);
        $params = [
            'vnp_TxnRef' => (string) $order->id,
            'vnp_Amount' => (string) ((int) $order->total_amount * 100),
            'vnp_ResponseCode' => '24',
            'vnp_TransactionStatus' => '02',
        ];
        ksort($params);
        $hashData = collect($params)->map(fn ($value, $key) => urlencode($key) . '=' . urlencode($value))->implode('&');
        $params['vnp_SecureHash'] = hash_hmac('sha512', $hashData, 'test-secret');

        $this->getJson('/api/payments/vnpay/ipn?' . http_build_query($params))
            ->assertOk()->assertJsonPath('RspCode', '00');
        $this->assertSame(2, $product->fresh()->stock);
        $this->assertSame(4, (int) $order->fresh()->status);
        $this->assertSame('failed', $order->fresh()->payment_status);
        Mail::assertSent(OrderStatusMail::class, fn (OrderStatusMail $mail): bool =>
            str_contains($mail->eventLabel, 'thất bại')
        );
    }

    public function test_vnpay_success_confirms_payment_once_without_restoring_stock(): void
    {
        Mail::fake();
        [$member, $product] = $this->makeMemberAndProduct(stock: 3);
        $order = $this->makeOrder($member, $product, 0, 1, 'vnpay');
        config(['services.vnpay.hash_secret' => 'test-secret']);
        $params = [
            'vnp_TxnRef' => (string) $order->id,
            'vnp_Amount' => (string) ((int) $order->total_amount * 100),
            'vnp_ResponseCode' => '00',
            'vnp_TransactionStatus' => '00',
        ];
        ksort($params);
        $hashData = collect($params)->map(fn ($value, $key) => urlencode($key) . '=' . urlencode($value))->implode('&');
        $params['vnp_SecureHash'] = hash_hmac('sha512', $hashData, 'test-secret');

        $this->getJson('/api/payments/vnpay/ipn?' . http_build_query($params))
            ->assertOk()->assertJsonPath('RspCode', '00');
        $this->getJson('/api/payments/vnpay/ipn?' . http_build_query($params))
            ->assertOk()->assertJsonPath('RspCode', '02');

        $this->assertSame(2, $product->fresh()->stock);
        $this->assertSame('paid', $order->fresh()->payment_status);
        Mail::assertSent(OrderStatusMail::class, 1);
    }

    public function test_late_vnpay_success_is_ignored_after_cancel_request_is_approved(): void
    {
        Mail::fake();
        [$member, $product] = $this->makeMemberAndProduct(stock: 3);
        $order = $this->makeOrder($member, $product, 0, 1, 'vnpay');
        $this->actingAs($member, 'sanctum')->postJson("/api/my-orders/{$order->id}/requests", [
            'type' => 'cancel', 'reason' => 'Tôi không muốn tiếp tục đơn hàng.',
        ])->assertCreated();
        $requestId = (int) $order->requests()->value('id');
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/order-requests/{$requestId}", [
            'status' => 'approved',
        ])->assertOk();

        config(['services.vnpay.hash_secret' => 'test-secret']);
        $params = [
            'vnp_TxnRef' => (string) $order->id,
            'vnp_Amount' => (string) ((int) $order->total_amount * 100),
            'vnp_ResponseCode' => '00',
            'vnp_TransactionStatus' => '00',
        ];
        ksort($params);
        $hashData = collect($params)->map(fn ($value, $key) => urlencode($key) . '=' . urlencode($value))->implode('&');
        $params['vnp_SecureHash'] = hash_hmac('sha512', $hashData, 'test-secret');

        $this->getJson('/api/payments/vnpay/ipn?' . http_build_query($params))
            ->assertOk()->assertJsonPath('RspCode', '02');
        $this->assertSame('cancelled', $order->fresh()->payment_status);
        $this->assertSame(4, (int) $order->fresh()->status);
        $this->assertSame(3, $product->fresh()->stock);
        Mail::assertSent(OrderStatusMail::class, 1);
    }

    public function test_admin_order_status_change_sends_a_customer_email(): void
    {
        Mail::fake();
        [$member, $product] = $this->makeMemberAndProduct();
        $order = $this->makeOrder($member, $product, 0, 1);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/orders/{$order->id}/status", [
            'status' => 1,
        ])->assertOk();

        Mail::assertSent(OrderStatusMail::class, fn (OrderStatusMail $mail): bool =>
            $mail->order->id === $order->id && str_contains($mail->eventLabel, 'Đã xác nhận')
        );
    }

    public function test_admin_cannot_cancel_an_order_already_in_shipping(): void
    {
        [$member, $product] = $this->makeMemberAndProduct(stock: 4);
        $order = $this->makeOrder($member, $product, 2, 1);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')->putJson("/api/admin/orders/{$order->id}/status", [
            'status' => 4,
        ])->assertUnprocessable();

        $this->assertSame(3, $product->fresh()->stock);
        $this->assertSame(2, (int) $order->fresh()->status);
    }

    private function makeMemberAndProduct(int $stock = 10, float $price = 100000): array
    {
        $member = User::factory()->create();
        $category = Category::create(['name' => 'Thiết bị', 'slug' => 'thiet-bi', 'status' => 1]);
        $brand = Brand::create(['name' => 'MyBrand', 'slug' => 'mybrand', 'status' => 1]);
        $product = Product::create([
            'cate_id' => $category->id, 'brand_id' => $brand->id,
            'name' => 'Sản phẩm kiểm thử', 'slug' => 'san-pham-kiem-thu-' . uniqid(),
            'price' => $price, 'promo_price' => null, 'stock' => $stock, 'status' => 1,
        ]);

        return [$member, $product];
    }

    private function makeOrder(User $member, Product $product, int $status, int $quantity, string $paymentMethod = 'cod'): Order
    {
        $order = Order::create([
            'order_code' => 'TEST-' . uniqid(), 'user_id' => $member->id,
            'cus_name' => $member->username, 'cus_email' => $member->email,
            'cus_phone' => '0900000000', 'cus_address' => 'Ho Chi Minh City',
            'total_amount' => 100000, 'shipping_fee' => 0,
            'payment_method' => $paymentMethod, 'payment_status' => 'pending', 'status' => $status,
        ]);
        $product->decrement('stock', $quantity);
        OrderItem::create([
            'order_id' => $order->id, 'product_id' => $product->id,
            'price' => 100000, 'quantity' => $quantity,
        ]);

        return $order;
    }
}
