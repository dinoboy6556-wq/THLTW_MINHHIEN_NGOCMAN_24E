<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $productIdType = $this->idColumnType('products');
        $userIdType = $this->idColumnType('user');

        Schema::create('product_reviews', function (Blueprint $table) use ($productIdType, $userIdType) {
            $table->id();
            $this->addMatchingIdColumn($table, 'product_id', $productIdType);
            $this->addMatchingIdColumn($table, 'user_id', $userIdType);
            $table->unsignedTinyInteger('rating');
            $table->text('comment');
            $table->timestamps();

            $table->unique(['product_id', 'user_id']);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('user')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }

    private function idColumnType(string $tableName): string
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return 'bigint unsigned';
        }

        $column = DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$tableName, 'id'],
        );

        return strtolower($column->COLUMN_TYPE ?? 'bigint unsigned');
    }

    private function addMatchingIdColumn(Blueprint $table, string $column, string $type): void
    {
        $isBigInteger = str_contains($type, 'bigint');
        $isUnsigned = str_contains($type, 'unsigned');

        if ($isBigInteger && $isUnsigned) {
            $table->unsignedBigInteger($column);
        } elseif ($isBigInteger) {
            $table->bigInteger($column);
        } elseif ($isUnsigned) {
            $table->unsignedInteger($column);
        } else {
            $table->integer($column);
        }
    }
};
