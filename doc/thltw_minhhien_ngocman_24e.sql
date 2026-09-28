-- --------------------------------------------------------
-- Máy chủ:                      127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Phiên bản:           12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table thltw_minhhien_ngocman_24e.brands: ~4 rows (approximately)
INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `description`, `status`) VALUES
	(1, 'Apple', 'apple', 'https://via.placeholder.com/150x50.png?text=Apple', 'Thương hiệu Apple', 1),
	(2, 'Samsung', 'samsung', 'https://via.placeholder.com/150x50.png?text=Samsung', 'Thương hiệu Samsung', 1),
	(3, 'ASUS', 'asus', 'https://via.placeholder.com/150x50.png?text=ASUS', 'Thương hiệu ASUS', 1),
	(4, 'Sony', 'sony', 'https://via.placeholder.com/150x50.png?text=Sony', 'Thương hiệu Sony', 1);

-- Dumping data for table thltw_minhhien_ngocman_24e.cart: ~0 rows (approximately)

-- Dumping data for table thltw_minhhien_ngocman_24e.cart_item: ~0 rows (approximately)

-- Dumping data for table thltw_minhhien_ngocman_24e.categories: ~5 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `status`) VALUES
	(1, 'Điện thoại & Tablet', 'dien-thoai-tablet', 'Các sản phẩm điện thoại thông minh và máy tính bảng', NULL, 1),
	(2, 'Laptop & Máy tính', 'laptop-may-tinh', 'Laptop văn phòng, gaming và máy tính để bàn', NULL, 1),
	(3, 'Phụ kiện công nghệ', 'phu-kien-cong-nghe', 'Tai nghe, sạc dự phòng, cáp sạc', NULL, 1),
	(4, 'Smartphone', 'smartphone', 'Điện thoại thông minh các hãng', 1, 1),
	(5, 'Laptop Gaming', 'laptop-gaming', 'Laptop cấu hình cao chơi game, đồ họa', 2, 1);

-- Dumping data for table thltw_minhhien_ngocman_24e.contacts: ~0 rows (approximately)

-- Dumping data for table thltw_minhhien_ngocman_24e.order: ~0 rows (approximately)

-- Dumping data for table thltw_minhhien_ngocman_24e.order_detail: ~0 rows (approximately)

-- Dumping data for table thltw_minhhien_ngocman_24e.post: ~0 rows (approximately)

-- Dumping data for table thltw_minhhien_ngocman_24e.products: ~4 rows (approximately)
INSERT INTO `products` (`id`, `cate_id`, `brand_id`, `name`, `slug`, `price`, `promo_price`, `stock`, `thumbnail`, `description`, `status`, `created_at`, `updated_at`) VALUES
	(1, 4, 1, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 34990000.00, 31990000.00, 15, 'https://via.placeholder.com/400x400.png?text=iPhone+15+Pro+Max', 'Khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ, camera 5x.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21'),
	(2, 4, 2, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra-5g', 33990000.00, 28990000.00, 20, 'https://via.placeholder.com/400x400.png?text=S24+Ultra', 'Quyền năng AI trong tay bạn, chip Snapdragon 8 Gen 3.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21'),
	(3, 5, 3, 'Laptop ASUS ROG Strix G16', 'laptop-asus-rog-strix-g16', 42990000.00, NULL, 8, 'https://via.placeholder.com/400x400.png?text=ASUS+ROG+G16', 'Intel Core i7-13650HX, RTX 4060 8GB, RAM 16GB, SSD 512GB.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21'),
	(4, 3, 4, 'Tai nghe Chống ồn Sony WH-1000XM5', 'tai-nghe-sony-wh-1000xm5', 8490000.00, 6990000.00, 30, 'https://via.placeholder.com/400x400.png?text=Sony+WH-1000XM5', 'Công nghệ chống ồn hàng đầu thế giới, pin 30 giờ.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21');

-- Dumping data for table thltw_minhhien_ngocman_24e.user: ~2 rows (approximately)
INSERT INTO `user` (`id`, `username`, `email`, `pass`, `phone`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.X2g1aM3aW', '0901234567', 'TP. Hồ Chí Minh', 'admin', 1, '2026-09-28 02:46:30', '2026-09-28 02:46:30'),
	(2, 'nguyenvana', 'vana@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.X2g1aM3aW', '0987654321', 'Hà Nội', 'member', 1, '2026-09-28 02:46:30', '2026-09-28 02:46:30');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
