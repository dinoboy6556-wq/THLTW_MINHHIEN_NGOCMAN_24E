<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Services\VnpayService;
use App\Services\OrderNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cus_name' => 'required|string|max:100',
            'cus_email' => 'required|email|max:100',
            'cus_phone' => 'required|string|max:20',
            'cus_address' => 'required|string|max:1000',
            'payment_method' => 'required|in:cod,vnpay,qr',
            'coupon_code' => 'nullable|string|max:40',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|distinct|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validated['payment_method'] === 'vnpay' && !app(VnpayService::class)->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa cấu hình kết nối VNPAY. Hãy thêm mã merchant và secret do VNPAY cấp vào backend/.env.',
            ], 503);
        }

        $quantities = collect($validated['items'])
            ->keyBy('product_id')
            ->map(fn (array $item): int => (int) $item['quantity']);

        $couponCode = isset($validated['coupon_code'])
            ? mb_strtoupper(trim($validated['coupon_code']))
            : null;

        $order = DB::transaction(function () use ($request, $validated, $quantities, $couponCode): Order {
            $products = Product::query()
                ->whereIn('id', $quantities->keys())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lineItems = [];

            foreach ($quantities as $productId => $quantity) {
                $product = $products->get($productId);

                if (!$product || (int) $product->status !== 1) {
                    throw ValidationException::withMessages([
                        'items' => 'Một sản phẩm không còn kinh doanh.',
                    ]);
                }

                if ((int) $product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Sản phẩm {$product->name} không đủ tồn kho.",
                    ]);
                }

                $salePrice = (float) $product->promo_price;
                $unitPrice = $salePrice > 0 && $salePrice < (float) $product->price
                    ? $salePrice
                    : (float) $product->price;

                $subtotal += $unitPrice * $quantity;
                $lineItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'price' => $unitPrice,
                ];
            }

            $coupon = null;
            $discountAmount = 0.0;
            if ($couponCode !== null && $couponCode !== '') {
                $coupon = Coupon::query()->where('code', $couponCode)->lockForUpdate()->first();
                if (!$coupon || !$coupon->isUsable((float) $subtotal)) {
                    throw ValidationException::withMessages([
                        'coupon_code' => 'Mã giảm giá không hợp lệ, đã hết hạn, hết lượt hoặc chưa đủ giá trị đơn hàng.',
                    ]);
                }
                $discountAmount = $coupon->discountFor((float) $subtotal);
                $coupon->increment('used_count');
            }

            $shippingFee = $subtotal >= 1000000 || $subtotal === 0 ? 0 : 30000;
            $order = Order::create([
                'order_code' => 'ORD-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(5)),
                'user_id' => $request->user('sanctum')?->getAuthIdentifier(),
                'cus_name' => $validated['cus_name'],
                'cus_email' => $validated['cus_email'],
                'cus_phone' => $validated['cus_phone'],
                'cus_address' => $validated['cus_address'],
                'total_amount' => round(max(0, $subtotal - $discountAmount) + $shippingFee, 2),
                'shipping_fee' => $shippingFee,
                'coupon_code' => $coupon?->code,
                'discount_amount' => $discountAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'status' => 0,
            ]);

            foreach ($lineItems as $lineItem) {
                $lineItem['product']->decrement('stock', $lineItem['quantity']);
                $order->items()->create([
                    'product_id' => $lineItem['product']->id,
                    'price' => $lineItem['price'],
                    'quantity' => $lineItem['quantity'],
                ]);
            }

            return $order;
        });

        $data = [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'total_amount' => (float) $order->total_amount,
            'shipping_fee' => (float) $order->shipping_fee,
            'coupon_code' => $order->coupon_code,
            'discount_amount' => (float) $order->discount_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
        ];

        if ($order->payment_method === 'vnpay') {
            $data['payment_url'] = app(VnpayService::class)->createPaymentUrl($order, $request);
        }

        app(OrderNotificationService::class)->send($order, 'Đơn hàng đã được tạo');

        return response()->json([
            'success' => true,
            'message' => 'Đặt hàng thành công.',
            'data' => $data,
        ], 201);
    }
}
