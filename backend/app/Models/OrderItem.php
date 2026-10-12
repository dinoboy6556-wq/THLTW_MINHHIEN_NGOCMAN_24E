<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'price',
        'quantity',
    ];

    // Quan hệ N-1 với Order
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    // Quan hệ N-1 với Product (lấy thông tin tên, ảnh sản phẩm)
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}