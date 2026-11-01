<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('posts')->insertOrIgnore([
            [
                'title' => 'Chọn laptop phù hợp: 5 điều nên cân nhắc trước khi mua',
                'slug' => 'chon-laptop-phu-hop-voi-nhu-cau',
                'category' => 'Tư vấn mua sắm',
                'excerpt' => 'Từ nhu cầu sử dụng, cấu hình đến thời lượng pin — đây là những điểm giúp bạn chọn được chiếc laptop phù hợp và dùng lâu dài.',
                'content' => implode("\n\n", [
                    "Bắt đầu từ nhu cầu sử dụng\nTrước khi so sánh cấu hình, hãy xác định công việc chính của bạn. Học tập, làm văn phòng, thiết kế đồ họa hay chơi game sẽ cần những ưu tiên khác nhau.\nMột chiếc máy gọn nhẹ và pin tốt phù hợp để di chuyển thường xuyên. Nếu làm đồ họa hoặc chơi game, hãy chú ý thêm đến card đồ họa và khả năng tản nhiệt.",
                    "Đừng bỏ qua bộ nhớ và màn hình\nRAM từ 16 GB giúp làm việc đa nhiệm thoải mái hơn. SSD cũng giúp máy khởi động và mở ứng dụng nhanh hơn đáng kể so với ổ cứng truyền thống.\nMàn hình là thứ bạn nhìn hàng ngày, vì vậy hãy cân nhắc kích thước, độ phân giải và độ sáng theo môi trường làm việc.",
                    "Tính cả chi phí sử dụng lâu dài\nNgoài giá mua, hãy xem chính sách bảo hành, khả năng nâng cấp và các cổng kết nối cần thiết. Một lựa chọn cân bằng sẽ hữu ích hơn cấu hình mạnh nhưng không phù hợp với cách bạn sử dụng.",
                ]),
                'cover_image' => null,
                'status' => 1,
                'published_at' => '2026-10-20 00:00:00',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Mẹo sử dụng giúp pin điện thoại bền hơn mỗi ngày',
                'slug' => 'meo-bao-ve-pin-dien-thoai',
                'category' => 'Mẹo công nghệ',
                'excerpt' => 'Một vài thay đổi nhỏ trong thói quen sạc và cài đặt có thể giúp bạn duy trì thời lượng pin ổn định theo thời gian.',
                'content' => implode("\n\n", [
                    "Hạn chế nhiệt độ quá cao\nNhiệt độ cao có thể ảnh hưởng đến tuổi thọ pin. Tránh để điện thoại dưới nắng lâu hoặc chạy tác vụ nặng trong lúc sạc nếu máy đang nóng.",
                    "Sạc theo cách thuận tiện và an toàn\nBạn không cần chờ pin cạn hoàn toàn mới sạc. Hãy ưu tiên bộ sạc đạt chuẩn và phụ kiện có nguồn gốc rõ ràng để đảm bảo quá trình sạc ổn định.\nNếu thiết bị có tính năng sạc tối ưu, hãy bật tính năng này để máy thích ứng với lịch sinh hoạt và giảm thời gian pin ở mức đầy.",
                    "Kiểm tra ứng dụng chạy nền\nỨng dụng cập nhật liên tục hoặc sử dụng vị trí có thể tiêu hao pin. Xem thống kê pin định kỳ để nhận biết ứng dụng nào đang dùng nhiều năng lượng và điều chỉnh khi cần.",
                ]),
                'cover_image' => null,
                'status' => 1,
                'published_at' => '2026-10-15 00:00:00',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Chọn tai nghe cho học tập và làm việc tại nhà',
                'slug' => 'chon-tai-nghe-cho-hoc-tap-va-lam-viec',
                'category' => 'Thiết bị',
                'excerpt' => 'Chống ồn, micro, kiểu đeo và thời lượng pin — những tiêu chí quan trọng để chọn tai nghe phù hợp với lịch làm việc của bạn.',
                'content' => implode("\n\n", [
                    "Ưu tiên sự thoải mái\nNếu thường đeo tai nghe nhiều giờ, trọng lượng nhẹ và phần đệm êm sẽ tạo khác biệt rõ rệt. Hãy chọn kiểu chụp tai hoặc nhét tai theo thói quen và mức độ di chuyển của bạn.",
                    "Chú ý chất lượng micro\nVới các cuộc họp trực tuyến, micro thu giọng rõ quan trọng không kém chất lượng âm thanh. Tính năng lọc tiếng ồn môi trường sẽ hữu ích nếu bạn làm việc ở nơi có nhiều âm thanh nền.",
                    "Chọn kết nối theo thiết bị\nTai nghe Bluetooth gọn gàng và tiện di chuyển; tai nghe có dây không cần sạc và thường kết nối nhanh. Hãy kiểm tra cổng kết nối tương thích trước khi chọn mua.",
                ]),
                'cover_image' => null,
                'status' => 1,
                'published_at' => '2026-10-08 00:00:00',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        // Keep posts managed by admins when rolling back this content migration.
    }
};
