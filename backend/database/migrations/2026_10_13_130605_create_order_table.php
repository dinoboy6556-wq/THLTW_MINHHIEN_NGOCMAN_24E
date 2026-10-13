<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('order', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 50);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('cus_name', 100);
            $table->string('cus_email', 100);
            $table->string('cus_phone', 20);
            $table->text('cus_address');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order');
    }
};
