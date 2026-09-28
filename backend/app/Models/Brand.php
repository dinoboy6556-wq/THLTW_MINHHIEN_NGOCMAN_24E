namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'description',
        'status',
    ];

    // Quan hệ 1-N: Một thương hiệu có nhiều sản phẩm
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Local Scope: Lọc thương hiệu active
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}