<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\VnpayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VnpayController extends Controller
{
    public function __construct(private readonly VnpayService $vnpay)
    {
    }

    public function ipn(Request $request): JsonResponse
    {
        $params = $request->query();
        if (!$this->vnpay->hasValidSignature($params)) {
            return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
        }

        $result = DB::transaction(function () use ($params): array {
            $order = Order::query()->lockForUpdate()->find($params['vnp_TxnRef'] ?? null);
            if (!$order || $order->payment_method !== 'vnpay') {
                return ['RspCode' => '01', 'Message' => 'Order not found'];
            }

            $expectedAmount = (int) round((float) $order->total_amount) * 100;
            if ((int) ($params['vnp_Amount'] ?? 0) !== $expectedAmount) {
                return ['RspCode' => '04', 'Message' => 'Invalid amount'];
            }

            if ($order->payment_status === 'paid') {
                return ['RspCode' => '02', 'Message' => 'Order already confirmed'];
            }

            $paid = ($params['vnp_ResponseCode'] ?? null) === '00'
                && ($params['vnp_TransactionStatus'] ?? null) === '00';
            $order->forceFill(['payment_status' => $paid ? 'paid' : 'failed'])->save();

            return ['RspCode' => '00', 'Message' => 'Confirm Success'];
        });

        return response()->json($result);
    }

    public function returnFromGateway(Request $request): RedirectResponse
    {
        $params = $request->query();
        $valid = $this->vnpay->hasValidSignature($params);
        $order = $valid
            ? Order::query()->find($params['vnp_TxnRef'] ?? null)
            : null;
        $amountMatches = $order
            && $order->payment_method === 'vnpay'
            && (int) ($params['vnp_Amount'] ?? 0) === (int) round((float) $order->total_amount) * 100;
        $paid = $amountMatches
            && ($params['vnp_ResponseCode'] ?? null) === '00'
            && ($params['vnp_TransactionStatus'] ?? null) === '00';

        $query = ['payment' => $paid ? 'success' : 'failed'];
        if ($order && $amountMatches) {
            $query['order_code'] = $order->order_code;
        }

        return redirect()->away(
            rtrim(config('services.vnpay.frontend_url'), '/') . '/cart?' . http_build_query($query)
        );
    }
}
