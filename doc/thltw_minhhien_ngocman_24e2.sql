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


-- Dumping database structure for thltw_minhhien_ngocman_24e
CREATE DATABASE IF NOT EXISTS `thltw_minhhien_ngocman_24e` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `thltw_minhhien_ngocman_24e`;

-- Dumping structure for table thltw_minhhien_ngocman_24e.brands
CREATE TABLE IF NOT EXISTS `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.brands: ~0 rows (approximately)
INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `description`, `status`) VALUES
	(1, 'Apple', 'apple', 'https://via.placeholder.com/150x50.png?text=Apple', 'Thương hiệu Apple', 1),
	(2, 'Samsung', 'samsung', 'https://via.placeholder.com/150x50.png?text=Samsung', 'Thương hiệu Samsung', 1),
	(3, 'ASUS', 'asus', 'https://via.placeholder.com/150x50.png?text=ASUS', 'Thương hiệu ASUS', 1),
	(4, 'Sony', 'sony', 'https://via.placeholder.com/150x50.png?text=Sony', 'Thương hiệu Sony', 1);

-- Dumping structure for table thltw_minhhien_ngocman_24e.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.cache: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.cache_locks: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.cart
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.cart: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.cart_item
CREATE TABLE IF NOT EXISTS `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_cart_item_cart` (`cart_id`),
  KEY `fk_cart_item_product` (`product_id`),
  CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.cart_item: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `parent_id` int DEFAULT NULL,
  `status` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.categories: ~0 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `status`) VALUES
	(1, 'Điện thoại & Tablet', 'dien-thoai-tablet', 'Các sản phẩm điện thoại thông minh và máy tính bảng', NULL, 1),
	(2, 'Laptop & Máy tính', 'laptop-may-tinh', 'Laptop văn phòng, gaming và máy tính để bàn', NULL, 1),
	(3, 'Phụ kiện công nghệ', 'phu-kien-cong-nghe', 'Tai nghe, sạc dự phòng, cáp sạc', NULL, 1),
	(4, 'Smartphone', 'smartphone', 'Điện thoại thông minh các hãng', 1, 1),
	(6, 'Đồng hồ thông minh', 'dong-ho-thong-minh', 'Các loại Smartwatch chính hãng', NULL, 1),
	(7, 'Đồng hồ thông minh1', 'dong-ho-thong-minh1', 'Các loại Smartwatch chính hãng', NULL, 1);

-- Dumping structure for table thltw_minhhien_ngocman_24e.contacts
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mess` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.contacts: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.jobs: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.job_batches: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.migrations: ~1 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_09_28_030757_create_personal_access_tokens_table', 1);

-- Dumping structure for table thltw_minhhien_ngocman_24e.order
CREATE TABLE IF NOT EXISTS `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `cus_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `cus_email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `cus_phone` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `cus_address` text COLLATE utf8mb4_general_ci NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `fk_order_user` (`user_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.order: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.order_detail
CREATE TABLE IF NOT EXISTS `order_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_order_detail_order` (`order_id`),
  KEY `fk_order_detail_product` (`product_id`),
  CONSTRAINT `fk_order_detail_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_detail_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.order_detail: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.personal_access_tokens: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.post
CREATE TABLE IF NOT EXISTS `post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_general_ci,
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `author_id` int NOT NULL,
  `status` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_post_author` (`author_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.post: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cate_id` int NOT NULL,
  `brand_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `promo_price` decimal(12,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `thumbnail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `status` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_products_categories` (`cate_id`),
  KEY `fk_products_brands` (`brand_id`),
  CONSTRAINT `fk_products_brands` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `fk_products_categories` FOREIGN KEY (`cate_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.products: ~0 rows (approximately)
INSERT INTO `products` (`id`, `cate_id`, `brand_id`, `name`, `slug`, `price`, `promo_price`, `stock`, `thumbnail`, `description`, `status`, `created_at`, `updated_at`) VALUES
	(1, 4, 1, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 34990000.00, 31990000.00, 15, 'https://via.placeholder.com/400x400.png?text=iPhone+15+Pro+Max', 'Khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ, camera 5x.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21'),
	(2, 4, 2, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra-5g', 33990000.00, 28990000.00, 20, 'https://via.placeholder.com/400x400.png?text=S24+Ultra', 'Quyền năng AI trong tay bạn, chip Snapdragon 8 Gen 3.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21'),
	(4, 3, 4, 'Tai nghe Chống ồn Sony WH-1000XM5', 'tai-nghe-sony-wh-1000xm5', 8490000.00, 6990000.00, 30, 'https://via.placeholder.com/400x400.png?text=Sony+WH-1000XM5', 'Công nghệ chống ồn hàng đầu thế giới, pin 30 giờ.', 1, '2026-09-28 02:45:21', '2026-09-28 02:45:21'),
	(6, 4, 1, 'RealMeC71', 'realmec71', 34990000.00, 32990000.00, 15, 'https://via.placeholder.com/400x400.png?text=iPhone+16', 'Chip A18 Pro mạnh mẽ, camera cải tiến vượt trội', 1, '2026-09-28 00:13:08', '2026-09-28 00:13:08'),
	(7, 4, 1, 'RealMeC72', 'realmec72', 34990000.00, 32990000.00, 15, 'https://via.placeholder.com/400x400.png?text=iPhone+16', 'Chip A18 Pro mạnh mẽ, camera cải tiến vượt trội', 1, '2026-09-28 09:14:49', '2026-09-28 09:14:49');

-- Dumping structure for table thltw_minhhien_ngocman_24e.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.sessions: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `pass` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `role` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'member',
  `status` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.user: ~0 rows (approximately)
INSERT INTO `user` (`id`, `username`, `email`, `pass`, `phone`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.X2g1aM3aW', '0901234567', 'TP. Hồ Chí Minh', 'admin', 1, '2026-09-28 02:46:30', '2026-09-28 02:46:30'),
	(2, 'nguyenvana', 'vana@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.X2g1aM3aW', '0987654321', 'Hà Nội', 'member', 1, '2026-09-28 02:46:30', '2026-09-28 02:46:30');

-- Dumping structure for table thltw_minhhien_ngocman_24e.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.users: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
