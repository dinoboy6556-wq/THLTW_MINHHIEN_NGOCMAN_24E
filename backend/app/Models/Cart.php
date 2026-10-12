<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'cart'; // Tên bảng trong CSDL của bạn

    protected $fillable = [
        'user_id',
        'session_id',
    ];

    // Quan hệ 1-N với CartItem
    public function items()
    {
        return $this->hasMany(CartItem::class, 'cart_id');
    }
}