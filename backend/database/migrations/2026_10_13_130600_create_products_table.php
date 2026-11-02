<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('products')) return;
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cate_id');
            $table->unsignedBigInteger('brand_id');
            $table->string('name');
            $table->string('slug');
            $table->decimal('price', 12, 2);
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('thumbnail')->nullable();
            $table->text('description')->nullable();
            $table->tinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
