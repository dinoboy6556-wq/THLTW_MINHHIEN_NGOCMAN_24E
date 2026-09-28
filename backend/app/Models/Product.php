<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'cate_id',       // Tên cột trong DB
        'brand_id',
        'name',
        'slug',
        'price',
        'promo_price',   // Tên cột trong DB
        'stock',         // Tên cột trong DB
        'thumbnail',
        'description',
        'status',
    ];

    protected $appends = ['final_price'];

    // Khai báo rõ khóa ngoại cate_id
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'cate_id', 'id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id', 'id');
    }

    // Accessor tính giá bán thực tế theo promo_price
    public function getFinalPriceAttribute(): float
    {
        return ($this->promo_price && $this->promo_price > 0) ? (float) $this->promo_price : (float) $this->price;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
    public $timestamps = false;
}