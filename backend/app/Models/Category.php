namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
use HasFactory;

protected $fillable = [
'parent_id',
'name',
'slug',
'description',
'image',
'status',
];

// Quan hệ Đệ quy: Danh mục cha
public function parent(): BelongsTo
{
return $this->belongsTo(Category::class, 'parent_id');
}

// Quan hệ Đệ quy: Các danh mục con
public function children(): HasMany
{
return $this->hasMany(Category::class, 'parent_id');
}

// Quan hệ 1-N: Một danh mục có nhiều sản phẩm
public function products(): HasMany
{
return $this->hasMany(Product::class);
}

// Local Scope: Lọc các danh mục đang hoạt động
public function scopeActive($query)
{
return $query->where('status', 'active');
}

// Local Scope: Chỉ lấy danh mục gốc (không có parent)
public function scopeParentsOnly($query)
{
return $query->whereNull('parent_id');
}
}