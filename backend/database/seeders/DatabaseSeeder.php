<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
// Thêm các Model tương ứng của bạn nếu có (ví dụ: Category, Brand, Product)

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo tài khoản test
        $testUser = User::factory()->raw([
            'username' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            $testUser
        );

        if (app()->environment(['local', 'testing'])) {
            $adminUser = User::factory()->raw([
                'username' => 'admin_test',
                'email' => 'admin@example.com',
                'role' => 'admin',
            ]);

            User::query()->firstOrCreate(
                ['email' => 'admin@example.com'],
                $adminUser
            );
        }

        // Nếu bạn có seeder cho danh mục, thương hiệu, sản phẩm, hãy gọi chúng ở đây:
        // $this->call([
        //     CategorySeeder::class,
        //     BrandSeeder::class,
        //     ProductSeeder::class,
        // ]);
    }
}
