<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminCouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Coupon::query()->latest()->paginate($request->integer('per_page', 20)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $coupon = Coupon::create($this->validatedData($request));

        return response()->json(['success' => true, 'data' => $coupon], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $coupon->update($this->validatedData($request, $coupon));

        return response()->json(['success' => true, 'data' => $coupon->refresh()]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        if ($coupon->used_count > 0) {
            $coupon->update(['is_active' => false]);
            return response()->json([
                'success' => true,
                'message' => 'Mã đã được sử dụng nên được vô hiệu hóa để giữ lịch sử đơn hàng.',
            ]);
        }

        $coupon->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa mã giảm giá.']);
    }

    private function validatedData(Request $request, ?Coupon $coupon = null): array
    {
        $data = $request->validate([
            'code' => [
                'required', 'string', 'max:40',
                Rule::unique('coupons', 'code')->ignore($coupon?->id),
            ],
            'discount_type' => ['required', Rule::in(['percent', 'fixed'])],
            'discount_value' => ['required', 'numeric', 'gt:0'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'maximum_discount_amount' => ['nullable', 'numeric', 'gt:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($data['discount_type'] === 'percent' && (float) $data['discount_value'] > 100) {
            throw ValidationException::withMessages([
                'discount_value' => 'Phần trăm giảm giá không được vượt quá 100%.',
            ]);
        }

        $data['code'] = mb_strtoupper(trim($data['code']));
        $data['minimum_order_amount'] ??= 0;

        return $data;
    }
}
