<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'categories';
    public $timestamps = false;

    protected $fillable = ['parent_id', 'name', 'slug', 'description', 'status'];

    // Scope lọc các danh mục đang hoạt động (status = 1)
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    // Scope lọc danh mục gốc (không có parent_id)
    public function scopeParentsOnly($query)
    {
        return $query->whereNull('parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'cate_id', 'id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id', 'id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id', 'id');
    }
}
