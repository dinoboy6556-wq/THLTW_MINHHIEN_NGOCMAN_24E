<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderRequest as CustomerOrderRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $requests = CustomerOrderRequest::query()
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->with('order:id,order_code,status,total_amount,payment_status')
            ->latest()
            ->paginate(10);

        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function store(Request $request, int $orderId): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:cancel,return'],
            'reason' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $order = Order::query()
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->findOrFail($orderId);

        $eligible = $validated['type'] === 'cancel'
            ? in_array((int) $order->status, [0, 1], true)
            : (int) $order->status === 3;

        if (!$eligible) {
            throw ValidationException::withMessages([
                'type' => $validated['type'] === 'cancel'
                    ? 'Chỉ có thể yêu cầu hủy đơn đang chờ xử lý hoặc đã xác nhận.'
                    : 'Chỉ có thể yêu cầu trả hàng sau khi đơn đã giao thành công.',
            ]);
        }

        $existingRequest = CustomerOrderRequest::query()
            ->where('order_id', $order->id)
            ->where('type', $validated['type'])
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($existingRequest) {
            throw ValidationException::withMessages([
                'type' => 'Đơn hàng đã có yêu cầu cùng loại đang xử lý hoặc đã được duyệt.',
            ]);
        }

        $orderRequest = CustomerOrderRequest::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->getAuthIdentifier(),
            'type' => $validated['type'],
            'reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi yêu cầu. Quản trị viên sẽ xem xét sớm.',
            'data' => $orderRequest,
        ], 201);
    }
}
