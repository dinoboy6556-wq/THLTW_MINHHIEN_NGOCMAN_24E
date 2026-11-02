<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $userIdType = $this->idColumnType('user');

        if (Schema::hasTable('order_requests')) {
            if (DB::connection()->getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE `order_requests` MODIFY `user_id` {$userIdType} NOT NULL");
                $hasForeignKey = DB::selectOne(
                    'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME = ?',
                    ['order_requests', 'user_id', 'user'],
                );
                if (!$hasForeignKey) {
                    Schema::table('order_requests', function (Blueprint $table) {
                        $table->foreign('user_id')->references('id')->on('user')->cascadeOnDelete();
                    });
                }
            }
            return;
        }

        Schema::create('order_requests', function (Blueprint $table) use ($userIdType) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $this->addMatchingIdColumn($table, 'user_id', $userIdType);
            $table->enum('type', ['cancel', 'return']);
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('admin_note')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('user')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_requests');
    }

    private function idColumnType(string $tableName): string
    {
        if (DB::connection()->getDriverName() !== 'mysql') return 'bigint unsigned';
        $column = DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$tableName, 'id'],
        );
        $type = strtolower($column->COLUMN_TYPE ?? 'bigint unsigned');
        if (!preg_match('/^(tinyint|smallint|mediumint|int|bigint)(?:\\(\\d+\\))?( unsigned)?$/', $type)) {
            throw new RuntimeException("Không xác định được kiểu {$tableName}.id để tạo khóa ngoại order_requests.user_id.");
        }
        return $type;
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
