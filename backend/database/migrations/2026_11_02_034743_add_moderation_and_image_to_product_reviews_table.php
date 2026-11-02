<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('comment');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->after('image_path')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['image_path', 'status']);
        });
    }
};
