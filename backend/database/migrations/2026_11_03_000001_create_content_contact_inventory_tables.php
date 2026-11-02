<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('static_pages')) Schema::create('static_pages', function (Blueprint $table) {
            $table->id(); $table->string('title'); $table->string('slug')->unique();
            $table->longText('content'); $table->boolean('is_published')->default(false); $table->timestamps();
        });
        if (!Schema::hasTable('banners')) Schema::create('banners', function (Blueprint $table) {
            $table->id(); $table->string('title'); $table->text('image_url'); $table->string('target_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0); $table->boolean('is_active')->default(true); $table->timestamps();
        });
        if (Schema::hasTable('banners') && !DB::table('banners')->where('title', 'MyShop Tech Days')->exists()) {
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
        if (!Schema::hasTable('contacts')) Schema::create('contacts', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('email'); $table->string('phone', 30)->nullable();
            $table->string('subject')->nullable(); $table->text('message'); $table->enum('status', ['new','processing','resolved'])->default('new');
            $table->text('admin_reply')->nullable(); $table->timestamps();
        });
        if (!Schema::hasTable('stock_movements')) Schema::create('stock_movements', function (Blueprint $table) {
            $table->id(); $table->unsignedBigInteger('product_id'); $table->enum('movement_type', ['in','out']);
            $table->unsignedInteger('quantity'); $table->string('reason'); $table->unsignedBigInteger('admin_id')->nullable(); $table->timestamps();
            $table->index(['product_id','created_at']);
        });
        if (!Schema::hasTable('post_categories')) Schema::create('post_categories', function (Blueprint $table) {
            $table->id(); $table->string('name',100); $table->string('slug',120)->unique(); $table->text('description')->nullable();
            $table->boolean('is_active')->default(true); $table->timestamps();
        });
        if (!Schema::hasTable('website_settings')) Schema::create('website_settings', function (Blueprint $table) {
            $table->id(); $table->string('key')->unique(); $table->longText('value')->nullable(); $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_settings'); Schema::dropIfExists('post_categories');
        Schema::dropIfExists('stock_movements'); Schema::dropIfExists('contacts');
        Schema::dropIfExists('banners'); Schema::dropIfExists('static_pages');
    }
};
