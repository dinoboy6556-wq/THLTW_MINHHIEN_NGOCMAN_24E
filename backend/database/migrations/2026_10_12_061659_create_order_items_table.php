<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // Khóa ngoại liên kết tới bảng orders (mới tạo có kiểu BIGINT)
            $table->unsignedBigInteger('order_id');

            // Đổi sang unsignedInteger để khớp kiểu INT của bảng products trong CSDL
            $table->unsignedInteger('product_id');

            $table->decimal('price', 15, 2);
            $table->integer('quantity')->default(1);
            $table->timestamps();

            // Ràng buộc khóa ngoại
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};