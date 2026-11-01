<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use SoftDeletes;

    protected $fillable = ['label', 'url', 'sort_order', 'status', 'open_new_tab'];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'open_new_tab' => 'boolean',
        ];
    }
}
