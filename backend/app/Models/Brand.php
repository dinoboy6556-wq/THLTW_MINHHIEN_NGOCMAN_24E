<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory;

    protected $table = 'brands';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'description',
        'status',
    ];

    // Mối quan hệ 1-N: Một thương hiệu có nhiều sản phẩm
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'brand_id', 'id');
    }

    // Local Scope: Lọc các thương hiệu đang hoạt động (status = 1)
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}