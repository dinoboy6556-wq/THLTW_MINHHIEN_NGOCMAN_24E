<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'order';

    protected $fillable = [
        'order_code',
        'user_id',
        'cus_name',
        'cus_email',
        'cus_phone',
        'cus_address',
        'total_amount',
        'shipping_fee',
        'payment_method',
        'payment_status',
        'status',
    ];

    protected $appends = ['customer_name', 'email', 'phone', 'shipping_address'];

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getCustomerNameAttribute(): string
    {
        return $this->cus_name;
    }

    public function getEmailAttribute(): string
    {
        return $this->cus_email;
    }

    public function getPhoneAttribute(): string
    {
        return $this->cus_phone;
    }

    public function getShippingAddressAttribute(): string
    {
        return $this->cus_address;
    }
}
