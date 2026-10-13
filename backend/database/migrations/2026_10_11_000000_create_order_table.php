<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('order', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->unsignedBigInteger('user_id');
            $table->string('cus_name');
            $table->string('cus_email')->nullable();
            $table->string('cus_phone');
            $table->text('cus_address');
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();

            // Sửa dòng này trong file create_order_table.php:
$table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order');
    }
};
