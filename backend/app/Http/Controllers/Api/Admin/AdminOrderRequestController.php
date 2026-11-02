<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderRequest as CustomerOrderRequest;
use App\Services\OrderNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminOrderRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $requests = CustomerOrderRequest::query()
            ->with(['order:id,order_code,cus_name,cus_email,status,payment_status,total_amount', 'user:id,username,email'])
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function update(
        Request $request,
        int $id,
        OrderNotificationService $orderNotifications,
    ): JsonResponse {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'admin_note' => ['nullable', 'string', 'max:2000'],
        ]);

        [$orderRequest, $order] = DB::transaction(function () use ($id, $validated): array {
            $orderRequest = CustomerOrderRequest::query()->lockForUpdate()->findOrFail($id);
            if ($orderRequest->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Yêu cầu này đã được xử lý trước đó.',
                ]);
            }

            $order = Order::query()->lockForUpdate()->findOrFail($orderRequest->order_id);

            if ($validated['status'] === 'approved') {
                if ($orderRequest->type === 'cancel') {
                    if ((int) $order->status === 4 || !in_array((int) $order->status, [0, 1], true)) {
                        throw ValidationException::withMessages([
                            'status' => 'Đơn hàng đã chuyển trạng thái nên không thể duyệt hủy.',
                        ]);
                    }

                    foreach ($order->items as $item) {
                        DB::table('products')
                            ->where('id', $item->product_id)
                            ->lockForUpdate()
                            ->increment('stock', $item->quantity);
                    }

                    $order->status = 4;
                    if ($order->payment_method === 'vnpay' && $order->payment_status === 'pending') {
                        $order->payment_status = 'cancelled';
                    }
                    if ($order->coupon_code) {
                        Coupon::query()->where('code', $order->coupon_code)->where('used_count', '>', 0)->decrement('used_count');
                    }
                    if ($order->payment_status === 'paid') {
                        $orderRequest->admin_note = trim(($validated['admin_note'] ?? '') . ' Hoàn tiền thanh toán điện tử cần được xử lý thủ công.');
                    }
                } else {
                    if ((int) $order->status !== 3) {
                        throw ValidationException::withMessages([
                            'status' => 'Chỉ có thể duyệt trả hàng cho đơn đã giao thành công.',
                        ]);
                    }

                    $alreadyReturned = CustomerOrderRequest::query()
                        ->where('order_id', $order->id)
                        ->where('type', 'return')
                        ->where('status', 'approved')
                        ->exists();

                    if ($alreadyReturned) {
                        throw ValidationException::withMessages([
                            'status' => 'Đơn hàng này đã được trả hàng trước đó.',
                        ]);
                    }

                    foreach ($order->items as $item) {
                        DB::table('products')
                            ->where('id', $item->product_id)
                            ->lockForUpdate()
                            ->increment('stock', $item->quantity);
                    }
                }
            }

            $orderRequest->status = $validated['status'];
            $orderRequest->admin_note = $orderRequest->admin_note ?? ($validated['admin_note'] ?? null);
            $orderRequest->processed_at = now();
            $orderRequest->save();
            $order->save();

            return [$orderRequest->fresh(), $order->fresh()];
        });

        $requestTypeLabel = $orderRequest->type === 'cancel' ? 'hủy đơn hàng' : 'trả hàng';
        $requestStatusLabel = $orderRequest->status === 'approved' ? 'đã được duyệt' : 'bị từ chối';
        $orderNotifications->send($order, "Yêu cầu {$requestTypeLabel} {$requestStatusLabel}");

        return response()->json([
            'success' => true,
            'message' => 'Đã xử lý yêu cầu.',
            'data' => $orderRequest,
        ]);
    }
}
