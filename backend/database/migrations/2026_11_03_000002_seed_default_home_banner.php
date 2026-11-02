<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('banners')) {
            return;
        }

        if (!DB::table('banners')->where('title', 'MyShop Tech Days')->exists()) {
            DB::table('banners')->insert([
                'title' => 'MyShop Tech Days',
                'image_url' => '/doc/myshop-banner-tech.svg',
                'target_url' => '/products',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('banners')->where('title', 'MyShop Tech Days')->delete();
    }
};
