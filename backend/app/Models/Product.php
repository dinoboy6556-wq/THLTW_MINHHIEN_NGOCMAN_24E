namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'price',
        'sale_price',
        'stock_quantity',
        'thumbnail',
        'description',
        'content',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    // Tự động append thuộc tính tính toán vào JSON response API
    protected $appends = ['final_price'];

    // Quan hệ N-1: Sản phẩm thuộc về 1 danh mục
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Quan hệ N-1: Sản phẩm thuộc về 1 thương hiệu
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    // Quan hệ 1-N: Sản phẩm có nhiều hình ảnh
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order', 'asc');
    }

    // Accessor: Tính giá bán thực tế (ưu tiên sale_price nếu có)
    public function getFinalPriceAttribute(): float
    {
        return ($this->sale_price && $this->sale_price > 0) ? (float) $this->sale_price : (float) $this->price;
    }

    // Local Scope: Lọc sản phẩm đang hiển thị
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Local Scope: Lọc sản phẩm còn hàng trong kho
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
}