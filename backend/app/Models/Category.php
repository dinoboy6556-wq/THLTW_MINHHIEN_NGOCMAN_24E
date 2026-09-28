<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'status',
    ];

    // Quan hệ: Danh mục cha
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id', 'id');
    }

    // Quan hệ: Các danh mục con
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id', 'id');
    }

    // Local Scope: Lọc danh mục đang hoạt động (status = 1)
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    // Local Scope: Chỉ lấy các danh mục gốc (không có parent)
    public function scopeParentsOnly($query)
    {
        return $query->whereNull('parent_id');
    }
}