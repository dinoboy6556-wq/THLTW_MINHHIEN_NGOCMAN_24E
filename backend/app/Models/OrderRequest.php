<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderRequest extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'type',
        'reason',
        'status',
        'admin_note',
        'processed_at',
    ];

    protected function casts(): array
    {
        return ['processed_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
