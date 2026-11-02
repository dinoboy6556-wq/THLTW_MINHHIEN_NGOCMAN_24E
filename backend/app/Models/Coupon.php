<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit',
        'used_count',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'minimum_order_amount' => 'decimal:2',
            'maximum_discount_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function isUsable(float $subtotal): bool
    {
        return $this->unusableReason($subtotal) === null;
    }

    public function unusableReason(float $subtotal): ?string
    {
        $now = now();
        if (!$this->is_active) return 'Mã giảm giá hiện đã bị tắt.';
        if ($subtotal < (float) $this->minimum_order_amount) {
            return 'Đơn hàng tối thiểu để dùng mã là ' . number_format((float) $this->minimum_order_amount, 0, ',', '.') . ' đ.';
        }
        if ($this->starts_at && $this->starts_at->gt($now)) return 'Mã giảm giá chưa đến thời gian bắt đầu.';
        if ($this->ends_at && $this->ends_at->lt($now)) return 'Mã giảm giá đã hết hạn.';
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) return 'Mã giảm giá đã hết lượt sử dụng.';
        return null;
    }

    public function discountFor(float $subtotal): float
    {
        $discount = $this->discount_type === 'percent'
            ? $subtotal * ((float) $this->discount_value / 100)
            : (float) $this->discount_value;

        if ($this->maximum_discount_amount !== null) {
            $discount = min($discount, (float) $this->maximum_discount_amount);
        }

        return round(min($subtotal, max(0, $discount)), 2);
    }
}
