<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $this->dropOrderForeignKeys();

        $orderId = DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            ['order', 'id'],
        );

        if (!$orderId || !preg_match('/^(tinyint|smallint|mediumint|int|bigint)(?:\\(\\d+\\))?( unsigned)?$/i', $orderId->COLUMN_TYPE)) {
            throw new RuntimeException('Không xác định được kiểu dữ liệu của order.id để sửa khóa ngoại order_items.');
        }

        $columnType = strtolower($orderId->COLUMN_TYPE);
        DB::statement("ALTER TABLE `order_items` MODIFY `order_id` {$columnType} NOT NULL");

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('order_id', 'order_items_order_id_foreign')
                ->references('id')
                ->on('order')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        $this->dropOrderForeignKeys();
    }

    private function dropOrderForeignKeys(): void
    {
        $foreignKeys = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
            ['order_items', 'order_id'],
        );

        foreach ($foreignKeys as $foreignKey) {
            $name = str_replace('`', '``', $foreignKey->CONSTRAINT_NAME);
            DB::statement("ALTER TABLE `order_items` DROP FOREIGN KEY `{$name}`");
        }
    }
};
