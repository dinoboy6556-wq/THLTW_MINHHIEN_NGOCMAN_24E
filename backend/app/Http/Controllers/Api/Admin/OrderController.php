<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Coupon;
use App\Services\OrderNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Lấy danh sách đơn hàng kèm chi tiết sản phẩm
    public function index()
    {
        $orders = Order::with(['items.product', 'user'])->latest()->get();
        return response()->json($orders);
    }

    // Chi tiết 1 đơn hàng
    public function show($id)
    {
        $order = Order::with(['items.product', 'user'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng!'], 404);
        }

        return response()->json($order);
    }

    // Cập nhật trạng thái đơn hàng (Chờ xử lý, Đã xác nhận, Đang giao,...)
    public function updateStatus(Request $request, int $id, OrderNotificationService $orderNotifications)
    {
        $request->validate([
            'status' => 'required|integer|in:0,1,2,3,4',
        ]);

        [$order, $statusChanged] = DB::transaction(function () use ($request, $id): array {
            $order = Order::query()->with('items')->lockForUpdate()->findOrFail($id);
            $previousStatus = (int) $order->status;
            $nextStatus = (int) $request->status;

            if ($previousStatus === 4 && $nextStatus !== 4) {
                abort(422, 'Đơn đã hủy không thể mở lại; hãy tạo đơn mới để tránh sai tồn kho.');
            }

            if ($nextStatus === 4 && !in_array($previousStatus, [0, 1, 4], true)) {
                abort(422, 'Đơn đã giao cho đơn vị vận chuyển. Hãy dùng quy trình yêu cầu trả hàng để xử lý tồn kho.');
            }

            if ($previousStatus !== 4 && $nextStatus === 4) {
                foreach ($order->items as $item) {
                    DB::table('products')
                        ->where('id', $item->product_id)
                        ->lockForUpdate()
                        ->increment('stock', $item->quantity);
                }
                if ($order->coupon_code) {
                    Coupon::query()->where('code', $order->coupon_code)->where('used_count', '>', 0)->decrement('used_count');
                }
                if ($order->payment_method === 'vnpay' && $order->payment_status === 'pending') {
                    $order->payment_status = 'cancelled';
                }
            }

            $order->status = $nextStatus;
            $order->save();

            return [$order->fresh(['items.product']), $previousStatus !== $nextStatus];
        });

        $statusLabels = [0 => 'Chờ xử lý', 1 => 'Đã xác nhận', 2 => 'Đang giao hàng', 3 => 'Đã hoàn thành', 4 => 'Đã hủy'];
        if ($statusChanged) {
            $orderNotifications->send($order, 'Trạng thái đơn hàng: ' . $statusLabels[(int) $order->status]);
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công!',
            'data' => $order
        ]);
    }

    // Xóa đơn hàng
    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng!'], 404);
        }

        $order->delete();

        return response()->json(['message' => 'Đã xóa đơn hàng thành công!']);
    }
}
