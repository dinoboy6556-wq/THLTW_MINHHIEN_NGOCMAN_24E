<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('label', 100);
            $table->string('url', 2048);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('status')->default(true);
            $table->boolean('open_new_tab')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        $now = now();
        DB::table('menu_items')->insert([
            ['label' => 'Trang chủ', 'url' => '/', 'sort_order' => 1, 'status' => true, 'open_new_tab' => false, 'created_at' => $now, 'updated_at' => $now],
            ['label' => 'Sản phẩm', 'url' => '/products', 'sort_order' => 2, 'status' => true, 'open_new_tab' => false, 'created_at' => $now, 'updated_at' => $now],
            ['label' => 'Bài viết', 'url' => '/posts', 'sort_order' => 3, 'status' => true, 'open_new_tab' => false, 'created_at' => $now, 'updated_at' => $now],
            ['label' => 'Danh mục', 'url' => '/categories', 'sort_order' => 4, 'status' => true, 'open_new_tab' => false, 'created_at' => $now, 'updated_at' => $now],
            ['label' => 'Thương hiệu', 'url' => '/brands', 'sort_order' => 5, 'status' => true, 'open_new_tab' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
