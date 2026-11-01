<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Http\Request;

class VnpayService
{
    public function isConfigured(): bool
    {
        return filled(config('services.vnpay.tmn_code'))
            && filled(config('services.vnpay.hash_secret'))
            && filled(config('services.vnpay.payment_url'))
            && filled(config('services.vnpay.return_url'));
    }

    public function createPaymentUrl(Order $order, Request $request): string
    {
        $now = now('Asia/Ho_Chi_Minh');
        $params = [
            'vnp_Version' => '2.1.0',
            'vnp_Command' => 'pay',
            'vnp_TmnCode' => config('services.vnpay.tmn_code'),
            'vnp_Amount' => (string) ((int) round((float) $order->total_amount) * 100),
            'vnp_CurrCode' => 'VND',
            'vnp_TxnRef' => (string) $order->id,
            'vnp_OrderInfo' => 'Thanh toan don hang ' . $order->order_code,
            'vnp_OrderType' => 'other',
            'vnp_Locale' => 'vn',
            'vnp_ReturnUrl' => config('services.vnpay.return_url'),
            'vnp_IpAddr' => $request->ip() ?: '127.0.0.1',
            'vnp_CreateDate' => $now->format('YmdHis'),
            'vnp_ExpireDate' => $now->copy()->addMinutes(15)->format('YmdHis'),
        ];

        ksort($params);
        $hashData = collect($params)
            ->map(fn (string $value, string $key): string => urlencode($key) . '=' . urlencode($value))
            ->implode('&');
        $secureHash = hash_hmac('sha512', $hashData, config('services.vnpay.hash_secret'));

        return rtrim(config('services.vnpay.payment_url'), '?')
            . '?' . http_build_query($params, '', '&', PHP_QUERY_RFC1738)
            . '&vnp_SecureHash=' . $secureHash;
    }

    public function hasValidSignature(array $params): bool
    {
        $receivedHash = $params['vnp_SecureHash'] ?? null;
        if (!is_string($receivedHash) || $receivedHash === '') {
            return false;
        }

        $signedParams = collect($params)
            ->filter(fn ($value, $key): bool => is_string($key)
                && str_starts_with($key, 'vnp_')
                && !in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType'], true)
                && is_scalar($value))
            ->all();
        ksort($signedParams);

        $hashData = collect($signedParams)
            ->map(fn ($value, string $key): string => urlencode($key) . '=' . urlencode((string) $value))
            ->implode('&');
        $expectedHash = hash_hmac('sha512', $hashData, (string) config('services.vnpay.hash_secret'));

        return hash_equals($expectedHash, $receivedHash);
    }
}
