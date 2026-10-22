export const articles = [
  {
    slug: "chon-laptop-phu-hop-voi-nhu-cau",
    title: "Chọn laptop phù hợp: 5 điều nên cân nhắc trước khi mua",
    excerpt:
      "Từ nhu cầu sử dụng, cấu hình đến thời lượng pin — đây là những điểm giúp bạn chọn được chiếc laptop phù hợp và dùng lâu dài.",
    category: "Tư vấn mua sắm",
    publishedAt: "20/10/2026",
    readTime: "5 phút đọc",
    icon: "💻",
    coverClass: "from-indigo-500 to-blue-400",
    sections: [
      {
        heading: "Bắt đầu từ nhu cầu sử dụng",
        paragraphs: [
          "Trước khi so sánh cấu hình, hãy xác định công việc chính của bạn. Học tập, làm văn phòng, thiết kế đồ họa hay chơi game sẽ cần những ưu tiên khác nhau.",
          "Một chiếc máy gọn nhẹ và pin tốt phù hợp để di chuyển thường xuyên. Nếu làm đồ họa hoặc chơi game, hãy chú ý thêm đến card đồ họa và khả năng tản nhiệt.",
        ],
      },
      {
        heading: "Đừng bỏ qua bộ nhớ và màn hình",
        paragraphs: [
          "RAM từ 16 GB giúp làm việc đa nhiệm thoải mái hơn. SSD cũng giúp máy khởi động và mở ứng dụng nhanh hơn đáng kể so với ổ cứng truyền thống.",
          "Màn hình là thứ bạn nhìn hàng ngày, vì vậy hãy cân nhắc kích thước, độ phân giải và độ sáng theo môi trường làm việc.",
        ],
      },
      {
        heading: "Tính cả chi phí sử dụng lâu dài",
        paragraphs: [
          "Ngoài giá mua, hãy xem chính sách bảo hành, khả năng nâng cấp và các cổng kết nối cần thiết. Một lựa chọn cân bằng sẽ hữu ích hơn cấu hình mạnh nhưng không phù hợp với cách bạn sử dụng.",
        ],
      },
    ],
  },
  {
    slug: "meo-bao-ve-pin-dien-thoai",
    title: "Mẹo sử dụng giúp pin điện thoại bền hơn mỗi ngày",
    excerpt:
      "Một vài thay đổi nhỏ trong thói quen sạc và cài đặt có thể giúp bạn duy trì thời lượng pin ổn định theo thời gian.",
    category: "Mẹo công nghệ",
    publishedAt: "15/10/2026",
    readTime: "4 phút đọc",
    icon: "🔋",
    coverClass: "from-emerald-500 to-teal-400",
    sections: [
      {
        heading: "Hạn chế nhiệt độ quá cao",
        paragraphs: [
          "Nhiệt độ cao có thể ảnh hưởng đến tuổi thọ pin. Tránh để điện thoại dưới nắng lâu hoặc chạy tác vụ nặng trong lúc sạc nếu máy đang nóng.",
        ],
      },
      {
        heading: "Sạc theo cách thuận tiện và an toàn",
        paragraphs: [
          "Bạn không cần chờ pin cạn hoàn toàn mới sạc. Hãy ưu tiên bộ sạc đạt chuẩn và phụ kiện có nguồn gốc rõ ràng để đảm bảo quá trình sạc ổn định.",
          "Nếu thiết bị có tính năng sạc tối ưu, hãy bật tính năng này để máy thích ứng với lịch sinh hoạt và giảm thời gian pin ở mức đầy.",
        ],
      },
      {
        heading: "Kiểm tra ứng dụng chạy nền",
        paragraphs: [
          "Ứng dụng cập nhật liên tục hoặc sử dụng vị trí có thể tiêu hao pin. Xem thống kê pin định kỳ để nhận biết ứng dụng nào đang dùng nhiều năng lượng và điều chỉnh khi cần.",
        ],
      },
    ],
  },
  {
    slug: "chon-tai-nghe-cho-hoc-tap-va-lam-viec",
    title: "Chọn tai nghe cho học tập và làm việc tại nhà",
    excerpt:
      "Chống ồn, micro, kiểu đeo và thời lượng pin — những tiêu chí quan trọng để chọn tai nghe phù hợp với lịch làm việc của bạn.",
    category: "Thiết bị",
    publishedAt: "08/10/2026",
    readTime: "3 phút đọc",
    icon: "🎧",
    coverClass: "from-fuchsia-500 to-purple-400",
    sections: [
      {
        heading: "Ưu tiên sự thoải mái",
        paragraphs: [
          "Nếu thường đeo tai nghe nhiều giờ, trọng lượng nhẹ và phần đệm êm sẽ tạo khác biệt rõ rệt. Hãy chọn kiểu chụp tai hoặc nhét tai theo thói quen và mức độ di chuyển của bạn.",
        ],
      },
      {
        heading: "Chú ý chất lượng micro",
        paragraphs: [
          "Với các cuộc họp trực tuyến, micro thu giọng rõ quan trọng không kém chất lượng âm thanh. Tính năng lọc tiếng ồn môi trường sẽ hữu ích nếu bạn làm việc ở nơi có nhiều âm thanh nền.",
        ],
      },
      {
        heading: "Chọn kết nối theo thiết bị",
        paragraphs: [
          "Tai nghe Bluetooth gọn gàng và tiện di chuyển; tai nghe có dây không cần sạc và thường kết nối nhanh. Hãy kiểm tra cổng kết nối tương thích trước khi chọn mua.",
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}
