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
        if (Schema::hasTable('product_reactions')) return;
        $productIdType = $this->idColumnType('products');
        $userIdType = $this->idColumnType('user');
        Schema::create('product_reactions', function (Blueprint $table) use ($productIdType, $userIdType) {
            $table->id();
            $this->addMatchingIdColumn($table, 'user_id', $userIdType);
            $this->addMatchingIdColumn($table, 'product_id', $productIdType);
            $table->enum('reaction', ['like', 'dislike']);
            $table->timestamps();

            $table->unique(['user_id', 'product_id']);
            $table->foreign('user_id')->references('id')->on('user')->cascadeOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reactions');
    }

    private function idColumnType(string $tableName): string
    {
        if (\Illuminate\Support\Facades\DB::connection()->getDriverName() !== 'mysql') return 'bigint unsigned';
        $column = \Illuminate\Support\Facades\DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$tableName, 'id'],
        );
        return strtolower($column->COLUMN_TYPE ?? 'bigint unsigned');
    }

    private function addMatchingIdColumn(Blueprint $table, string $column, string $type): void
    {
        $big = str_contains($type, 'bigint');
        $unsigned = str_contains($type, 'unsigned');
        if ($big && $unsigned) $table->unsignedBigInteger($column);
        elseif ($big) $table->bigInteger($column);
        elseif ($unsigned) $table->unsignedInteger($column);
        else $table->integer($column);
    }
};
