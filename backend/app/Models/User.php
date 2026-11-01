<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    // 1. Chỉ định chính xác tên bảng trong Database
    protected $table = 'user';

    public $timestamps = true;

    protected $fillable = [
        'username',
        'email',
        'pass',
        'phone',
        'address',
        'avatar',
        'role',
        'status',
    ];

    protected $hidden = [
        'pass',
        'remember_token',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    // 2. Khai báo cho Laravel Auth biết cột mật khẩu tên là 'pass'
    public function getAuthPassword()
    {
        return $this->pass;
    }
}
