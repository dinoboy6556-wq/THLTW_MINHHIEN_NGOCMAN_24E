<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products';
    public $timestamps = true;

    protected $fillable = [
        'cate_id',
        'brand_id',
        'name',
        'slug',
        'price',
        'promo_price',
        'stock',
        'thumbnail',
        'description',
        'status'
    ];

    // Scope lọc các sản phẩm đang bật bán (status = 1)
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'cate_id', 'id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function favorites()
    {
        return $this->hasMany(ProductFavorite::class);
    }

    public function reactions()
    {
        return $this->hasMany(ProductReaction::class);
    }
}
