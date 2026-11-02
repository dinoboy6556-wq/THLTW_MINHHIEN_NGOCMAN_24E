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
        if (!Schema::hasTable('product_reviews')) {
            return;
        }

        Schema::table('product_reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('product_reviews', 'image_path')) {
                $table->string('image_path')->nullable()->after('comment');
            }
            if (!Schema::hasColumn('product_reviews', 'status')) {
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->index();
            }
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
