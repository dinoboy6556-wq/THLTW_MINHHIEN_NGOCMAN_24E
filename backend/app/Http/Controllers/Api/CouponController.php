<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:40'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::query()
            ->where('code', mb_strtoupper(trim($validated['code'])))
            ->first();

        if (!$coupon || !$coupon->isUsable((float) $validated['subtotal'])) {
            throw ValidationException::withMessages([
                'code' => 'Mã giảm giá không hợp lệ, đã hết hạn hoặc không đủ điều kiện sử dụng.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $coupon->code,
                'discount_amount' => $coupon->discountFor((float) $validated['subtotal']),
                'discount_type' => $coupon->discount_type,
                'discount_value' => (float) $coupon->discount_value,
            ],
        ]);
    }
}
