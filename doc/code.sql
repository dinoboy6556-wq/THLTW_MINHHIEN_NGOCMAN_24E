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

-- Dumping structure for table thltw_minhhien_ngocman_24e.banners
CREATE TABLE IF NOT EXISTS `banners` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.banners: ~1 rows (approximately)
INSERT INTO `banners` (`id`, `title`, `image_url`, `target_url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'MyShop Tech Days', '/doc/myshop-banner-tech.svg', '/products', 1, 1, '2026-11-02 00:06:59', '2026-11-02 00:06:59');

-- Dumping structure for table thltw_minhhien_ngocman_24e.brands
CREATE TABLE IF NOT EXISTS `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `status` tinyint DEFAULT '1',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.brands: ~8 rows (approximately)
INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `description`, `status`, `deleted_at`) VALUES
	(1, 'Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 'Thương hiệu Apple', 1, NULL),
	(2, 'Samsung', 'samsung', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', 'Thương hiệu Samsung', 1, NULL),
	(3, 'ASUS', 'asus', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg', 'Thương hiệu ASUS', 1, NULL),
	(4, 'Sony', 'sony', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', 'Thương hiệu Sony', 1, NULL),
	(6, 'Xiaomi', 'xiaomi', 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg', 'Thương hiệu Xiaomi', 1, NULL),
	(7, 'Dell', 'dell', 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_%282016%29.svg', 'Thương hiệu Dell', 1, NULL),
	(8, 'Logitech', 'logitech', 'https://via.placeholder.com/150x50.png?text=Logitech', 'Thương hiệu Logitech', 1, NULL),
	(10, 'Bowers & Wilkins', 'bowers-wilkins', NULL, 'Thương hiệu thiết bị âm thanh', 1, NULL),
	(11, 'JBL', 'jbl', NULL, 'Thương hiệu thiết bị công nghệ', 1, NULL),
	(12, 'Anker', 'anker', NULL, 'Thương hiệu thiết bị công nghệ', 1, NULL);

-- Dumping structure for table thltw_minhhien_ngocman_24e.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.cache: ~0 rows (approximately)
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
	('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1793550134),
	('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1793550134;', 1793550134);

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
  `user_id` int DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.categories: ~12 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `status`, `deleted_at`) VALUES
	(1, 'Điện thoại & Tablet', 'dien-thoai-tablet', 'Các sản phẩm điện thoại thông minh và máy tính bảng', NULL, 1, NULL),
	(2, 'Laptop & Máy tính', 'laptop-may-tinh', 'Laptop văn phòng, gaming và máy tính để bàn', NULL, 1, NULL),
	(3, 'Phụ kiện công nghệ', 'phu-kien-cong-nghe', 'Tai nghe, sạc dự phòng, cáp sạc', NULL, 1, NULL),
	(4, 'Smartphone', 'smartphone', 'Điện thoại thông minh các hãng', 1, 1, NULL),
	(6, 'Đồng hồ thông minh', 'dong-ho-thong-minh', 'Các loại Smartwatch chính hãng', NULL, 1, NULL),
	(8, 'Màn Hình Gaming', 'man-hinh-gaming', 'Màn hình tần số quét cao cho game thủ', NULL, 1, NULL),
	(12, 'Laptop Gaming', 'laptop-gaming', 'Các dòng laptop chuyên game cấu hình cao', 2, 1, NULL),
	(13, 'Máy Tính Bảng', 'may-tinh-bang', 'Các loại iPad, Tablet Android chính hãng', 1, 1, NULL),
	(14, 'Sạc & Cáp', 'sac-cap', 'Sạc nhanh, cáp Type-C, Lightning chính hãng', 3, 1, NULL);

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

-- Dumping structure for table thltw_minhhien_ngocman_24e.coupons
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percent','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `minimum_order_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `maximum_discount_amount` decimal(12,2) DEFAULT NULL,
  `usage_limit` int unsigned DEFAULT NULL,
  `used_count` int unsigned NOT NULL DEFAULT '0',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.coupons: ~1 rows (approximately)
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `minimum_order_amount`, `maximum_discount_amount`, `usage_limit`, `used_count`, `starts_at`, `ends_at`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'MIN90WT', 'percent', 30.00, 100000.00, NULL, NULL, 1, NULL, '2026-11-30 06:53:00', 1, '2026-11-01 23:53:22', '2026-11-02 00:17:20');

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

-- Dumping structure for table thltw_minhhien_ngocman_24e.menu_items
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int unsigned NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `open_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.menu_items: ~5 rows (approximately)
INSERT INTO `menu_items` (`id`, `label`, `url`, `sort_order`, `status`, `open_new_tab`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'Trang chủ', '/', 1, 1, 0, '2026-11-01 08:17:42', '2026-11-01 08:17:42', NULL),
	(2, 'Sản phẩm', '/products', 2, 1, 0, '2026-11-01 08:17:42', '2026-11-01 08:17:42', NULL),
	(3, 'Bài viết', '/posts', 3, 1, 0, '2026-11-01 08:17:42', '2026-11-01 08:17:42', NULL),
	(4, 'Danh mục', '/categories', 4, 1, 0, '2026-11-01 08:17:42', '2026-11-01 08:17:42', NULL),
	(5, 'Thương hiệu', '/brands', 5, 1, 0, '2026-11-01 08:17:42', '2026-11-01 08:19:48', NULL);

-- Dumping structure for table thltw_minhhien_ngocman_24e.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.migrations: ~0 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_09_28_030757_create_personal_access_tokens_table', 1),
	(5, '2026_10_24_142628_create_posts_table', 2),
	(6, '2026_10_26_000000_import_featured_articles_into_posts', 3),
	(7, '2026_11_01_092711_add_soft_deletes_to_admin_resources', 4),
	(8, '2026_10_15_023015_add_checkout_fields_to_order_table', 5),
	(9, '2026_11_01_132144_add_avatar_to_user_table', 6),
	(10, '2026_11_01_151532_create_menu_items_table', 7),
	(11, '2026_10_26_130000_create_product_reviews_table', 8),
	(12, '2026_11_02_000000_fix_order_items_order_foreign_key', 9),
	(13, '2026_11_02_034743_add_moderation_and_image_to_product_reviews_table', 10),
	(14, '2026_10_13_130500_create_categories_table', 11),
	(15, '2026_10_13_130550_create_brands_table', 11),
	(16, '2026_10_13_130600_create_products_table', 11),
	(17, '2026_10_13_130605_create_order_table', 11),
	(18, '2026_10_13_130610_create_order_items_table', 11),
	(19, '2026_10_13_133130_create_legacy_user_table', 11),
	(20, '2026_11_02_034739_create_coupons_table', 11),
	(21, '2026_11_02_034740_create_product_favorites_table', 11),
	(22, '2026_11_02_034742_create_product_reactions_table', 11),
	(23, '2026_11_02_034745_create_order_requests_table', 12),
	(24, '2026_11_02_034837_add_coupon_discount_fields_to_order_table', 12),
	(25, '2026_11_03_000001_create_content_contact_inventory_tables', 13),
	(26, '2026_11_03_000002_seed_default_home_banner', 14);

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
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '0',
  `payment_method` varchar(32) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'cod',
  `payment_status` varchar(32) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coupon_code` varchar(40) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `fk_order_user` (`user_id`),
  KEY `order_coupon_code_index` (`coupon_code`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.order: ~5 rows (approximately)
INSERT INTO `order` (`id`, `order_code`, `user_id`, `cus_name`, `cus_email`, `cus_phone`, `cus_address`, `total_amount`, `created_at`, `updated_at`, `deleted_at`, `status`, `payment_method`, `payment_status`, `shipping_fee`, `coupon_code`, `discount_amount`) VALUES
	(8, 'ORD-20261101224438-RG39A', 9, 'LeTranMinhHien', 'dinoboy6556@gmail.com', '09093337702', '288/9 Dương Đình Hội', 13450000.00, '2026-11-01 15:44:38', '2026-11-01 18:22:19', NULL, 4, 'vnpay', 'pending', 0.00, NULL, 0.00),
	(9, 'ORD-20261101224528-H8F3K', 9, 'LeTranMinhHien', 'dinoboy6556@gmail.com', '09093337702', '288/9 Dương Đình Hội', 13450000.00, '2026-11-01 15:45:28', '2026-11-01 18:22:12', NULL, 4, 'vnpay', 'pending', 0.00, NULL, 0.00),
	(10, 'ORD-20261101225353-E1KPT', 9, 'LeTranMinhHien', 'dinoboy6556@gmail.com', '09093337702', '288/9 Dương Đình Hội', 13980000.00, '2026-11-01 15:53:53', '2026-11-01 18:22:04', NULL, 1, 'vnpay', 'paid', 0.00, NULL, 0.00),
	(11, 'ORD-20261102071720-QQLG2', 9, 'LeTranMinhHien', 'dinoboy6556@gmail.com', '09093337702', '288/9 Dương Đình Hội', 9093000.00, '2026-11-02 00:17:20', '2026-11-02 00:18:51', NULL, 0, 'vnpay', 'paid', 0.00, 'MIN90WT', 3897000.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.order_detail: ~6 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.order_items: ~0 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `price`, `quantity`, `created_at`, `updated_at`) VALUES
	(3, 8, 25, 2690000.00, 5, '2026-11-01 15:44:38', '2026-11-01 15:44:38'),
	(4, 9, 25, 2690000.00, 5, '2026-11-01 15:45:28', '2026-11-01 15:45:28'),
	(5, 10, 35, 6990000.00, 2, '2026-11-01 15:53:53', '2026-11-01 15:53:53'),
	(6, 11, 7, 12990000.00, 1, '2026-11-02 00:17:20', '2026-11-02 00:17:20');

-- Dumping structure for table thltw_minhhien_ngocman_24e.order_requests
CREATE TABLE IF NOT EXISTS `order_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('cancel','return') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_requests_user_id_foreign` (`user_id`),
  CONSTRAINT `order_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.order_requests: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.personal_access_tokens: ~3 rows (approximately)
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 'App\\Models\\User', 3, 'auth_token', '36ec3ef6b28f5561ec519f8e78538fc0a0c0e2e71c92508c8dcd4cfadcb067fb', '["*"]', NULL, NULL, '2026-09-28 04:47:20', '2026-09-28 04:47:20'),
	(5, 'App\\Models\\User', 3, 'auth_token', '4ff4c13052938e0ddea27c9a8513615c230f1e237369d12aba6bce4e8f75ddf9', '["*"]', '2026-10-05 02:36:49', NULL, '2026-10-05 01:57:40', '2026-10-05 02:36:49'),
	(8, 'App\\Models\\User', 4, 'auth_token', '6b7bb2b0f11d5a0b8fe6ea090129f924a912ace8b01c35488c163164b7621446', '["*"]', '2026-10-12 04:27:39', NULL, '2026-10-12 04:27:31', '2026-10-12 04:27:39'),
	(19, 'App\\Models\\User', 9, 'auth_token', '29658d1080262bc8f76736ab7b888cd37b4f2851df3af73d556a03caa338eb81', '["*"]', NULL, NULL, '2026-11-01 09:24:33', '2026-11-01 09:24:33'),
	(21, 'App\\Models\\User', 9, 'auth_token', '5fb7ed7ed92112e1f626f20bff2e54e70419b28cbe11ccb5f4a1f5dbd6aa9f99', '["*"]', '2026-11-01 15:53:53', NULL, '2026-11-01 15:33:39', '2026-11-01 15:53:53'),
	(23, 'App\\Models\\User', 3, 'auth_token', '4dbdf2217af140c137794e81abca153a0988d8dbca32db6fcb6d77a989cfeb59', '["*"]', '2026-11-01 20:10:30', NULL, '2026-11-01 20:09:52', '2026-11-01 20:10:30'),
	(31, 'App\\Models\\User', 4, 'auth_token', '35ac1632e314cc1edea19d5a8d6c3f0713caf224faae52d14aab305191c61f4d', '["*"]', '2026-11-02 00:23:42', NULL, '2026-11-02 00:22:37', '2026-11-02 00:23:42');

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

-- Dumping structure for table thltw_minhhien_ngocman_24e.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_image` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `posts_slug_unique` (`slug`),
  KEY `posts_published_at_index` (`published_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.posts: ~3 rows (approximately)
INSERT INTO `posts` (`id`, `title`, `slug`, `category`, `excerpt`, `content`, `cover_image`, `status`, `published_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'Chọn laptop phù hợp: 5 điều nên cân nhắc trước khi mua', 'chon-laptop-phu-hop-voi-nhu-cau', 'Tư vấn mua sắm', 'Từ nhu cầu sử dụng, cấu hình đến thời lượng pin — đây là những điểm giúp bạn chọn được chiếc laptop phù hợp và dùng lâu dài.', 'Bắt đầu từ nhu cầu sử dụng\nTrước khi so sánh cấu hình, hãy xác định công việc chính của bạn. Học tập, làm văn phòng, thiết kế đồ họa hay chơi game sẽ cần những ưu tiên khác nhau.\nMột chiếc máy gọn nhẹ và pin tốt phù hợp để di chuyển thường xuyên. Nếu làm đồ họa hoặc chơi game, hãy chú ý thêm đến card đồ họa và khả năng tản nhiệt.\n\nĐừng bỏ qua bộ nhớ và màn hình\nRAM từ 16 GB giúp làm việc đa nhiệm thoải mái hơn. SSD cũng giúp máy khởi động và mở ứng dụng nhanh hơn đáng kể so với ổ cứng truyền thống.\nMàn hình là thứ bạn nhìn hàng ngày, vì vậy hãy cân nhắc kích thước, độ phân giải và độ sáng theo môi trường làm việc.\n\nTính cả chi phí sử dụng lâu dài\nNgoài giá mua, hãy xem chính sách bảo hành, khả năng nâng cấp và các cổng kết nối cần thiết. Một lựa chọn cân bằng sẽ hữu ích hơn cấu hình mạnh nhưng không phù hợp với cách bạn sử dụng.', NULL, 1, '2026-10-19 17:00:00', '2026-11-01 01:34:40', '2026-11-01 01:34:40', NULL),
	(2, 'Mẹo sử dụng giúp pin điện thoại bền hơn mỗi ngày', 'meo-bao-ve-pin-dien-thoai', 'Mẹo công nghệ', 'Một vài thay đổi nhỏ trong thói quen sạc và cài đặt có thể giúp bạn duy trì thời lượng pin ổn định theo thời gian.', 'Hạn chế nhiệt độ quá cao\nNhiệt độ cao có thể ảnh hưởng đến tuổi thọ pin. Tránh để điện thoại dưới nắng lâu hoặc chạy tác vụ nặng trong lúc sạc nếu máy đang nóng.\n\nSạc theo cách thuận tiện và an toàn\nBạn không cần chờ pin cạn hoàn toàn mới sạc. Hãy ưu tiên bộ sạc đạt chuẩn và phụ kiện có nguồn gốc rõ ràng để đảm bảo quá trình sạc ổn định.\nNếu thiết bị có tính năng sạc tối ưu, hãy bật tính năng này để máy thích ứng với lịch sinh hoạt và giảm thời gian pin ở mức đầy.\n\nKiểm tra ứng dụng chạy nền\nỨng dụng cập nhật liên tục hoặc sử dụng vị trí có thể tiêu hao pin. Xem thống kê pin định kỳ để nhận biết ứng dụng nào đang dùng nhiều năng lượng và điều chỉnh khi cần.', NULL, 1, '2026-10-14 17:00:00', '2026-11-01 01:34:40', '2026-11-01 01:34:40', NULL),
	(3, 'Chọn tai nghe cho học tập và làm việc tại nhà', 'chon-tai-nghe-cho-hoc-tap-va-lam-viec', 'Thiết bị', 'Chống ồn, micro, kiểu đeo và thời lượng pin — những tiêu chí quan trọng để chọn tai nghe phù hợp với lịch làm việc của bạn.', 'Ưu tiên sự thoải mái\nNếu thường đeo tai nghe nhiều giờ, trọng lượng nhẹ và phần đệm êm sẽ tạo khác biệt rõ rệt. Hãy chọn kiểu chụp tai hoặc nhét tai theo thói quen và mức độ di chuyển của bạn.\n\nChú ý chất lượng micro\nVới các cuộc họp trực tuyến, micro thu giọng rõ quan trọng không kém chất lượng âm thanh. Tính năng lọc tiếng ồn môi trường sẽ hữu ích nếu bạn làm việc ở nơi có nhiều âm thanh nền.\n\nChọn kết nối theo thiết bị\nTai nghe Bluetooth gọn gàng và tiện di chuyển; tai nghe có dây không cần sạc và thường kết nối nhanh. Hãy kiểm tra cổng kết nối tương thích trước khi chọn mua.', NULL, 1, '2026-10-07 17:00:00', '2026-11-01 01:34:40', '2026-11-01 01:34:40', NULL);

-- Dumping structure for table thltw_minhhien_ngocman_24e.post_categories
CREATE TABLE IF NOT EXISTS `post_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.post_categories: ~0 rows (approximately)

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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_products_categories` (`cate_id`),
  KEY `fk_products_brands` (`brand_id`),
  CONSTRAINT `fk_products_brands` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `fk_products_categories` FOREIGN KEY (`cate_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.products: ~11 rows (approximately)
INSERT INTO `products` (`id`, `cate_id`, `brand_id`, `name`, `slug`, `price`, `promo_price`, `stock`, `thumbnail`, `description`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 4, 1, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 34990000.00, 31990000.00, 15, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop', 'Khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ, camera 5x.', 1, '2026-09-28 02:45:21', '2026-10-12 12:24:33', NULL),
	(2, 1, 2, 'Samsung Galaxy S24 Ultra 5G', 'samsung-galaxy-s24-ultra-5g', 33990000.00, 28990000.00, 20, 'products/oSdh0vEBW5vJMsFqMWcZwX7vYPS0jHaghPXF2J0I.jpg', 'Quyền năng AI trong tay bạn, chip Snapdragon 8 Gen 3.', 1, '2026-09-28 02:45:21', '2026-11-01 19:16:42', NULL),
	(4, 3, 4, 'Tai nghe Chống ồn Sony WH-1000XM5', 'tai-nghe-sony-wh-1000xm5', 8490000.00, 7490000.00, 30, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', 'Công nghệ chống ồn hàng đầu thế giới, pin 30 giờ.', 1, '2026-09-28 02:45:21', '2026-10-12 12:24:33', NULL),
	(6, 4, 1, 'RealMeC71', 'realmec71', 34990000.00, 12990000.00, 15, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop', 'Chip A18 Pro mạnh mẽ, camera cải tiến vượt trội', 1, '2026-09-28 00:13:08', '2026-10-12 12:24:33', NULL),
	(7, 4, 1, 'RealMeC72', 'realmec72', 34990000.00, 12990000.00, 14, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop', 'Chip A18 Pro mạnh mẽ, camera cải tiến vượt trội', 1, '2026-09-28 09:14:49', '2026-11-02 00:17:20', NULL),
	(8, 4, 1, 'iPhone 16 Pro Max 256GB', 'iphone-16-pro-max-256gb', 34990000.00, 31990000.00, 25, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop', 'Chip A18 Pro mạnh mẽ, camera cải tiến vượt trội', 1, '2026-10-05 10:26:26', '2026-10-12 12:24:33', NULL),
	(9, 1, 2, 'Samsung Galaxy Z Fold 6 512GB', 'samsung-galaxy-z-fold-6-512gb', 43990000.00, 39990000.00, 10, 'products/hq7iVnBHEtVjF6vVHYPNkFml7YTZimgrGighdgQ1.jpg', 'Thiết kế màn hình gập cao cấp, tính năng Galaxy AI', 1, '2026-10-05 10:26:26', '2026-11-01 19:16:11', NULL),
	(10, 2, 3, 'Laptop ASUS ROG Strix G16', 'laptop-asus-rog-strix-g16', 38990000.00, 35990000.00, 8, 'products/nftIQHagQEzRnzuYxBQ9yupJPmQWLUIyzLGTOY8h.jpg', 'Intel Core i7 14700HX, RTX 4060, màn 240Hz', 1, '2026-10-05 10:26:26', '2026-11-01 19:15:51', NULL),
	(11, 3, 4, 'Tai nghe Sony WF-1000XM5', 'tai-nghe-sony-wf-1000xm5', 6990000.00, NULL, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', 'Tai nghe nhét tai chống ồn hàng đầu thế giới', 1, '2026-10-05 10:26:26', '2026-11-01 02:11:10', NULL),
	(18, 3, 10, 'Tai nghe Bowers & Wilkins', 'tai-nghe-bowers-wilkins', 8490000.00, NULL, 5, 'images/products/bowers-wilkins-headphones.png', 'Tai nghe chụp tai Bowers & Wilkins. Sản phẩm không áp dụng khuyến mãi.', 1, '2026-11-01 02:13:13', '2026-11-01 02:14:24', NULL),
	(19, 3, 1, 'Bàn phím Apple Magic Keyboard', 'ban-phim-apple-magic-keyboard', 2790000.00, NULL, 6, 'products/ST9gIpX0s7VEku7ZxlBKh9DQETCkfEC3IdCJcF0l.jpg', 'Bàn phím Apple Magic Keyboard kết nối Bluetooth. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:09:23', NULL),
	(20, 6, 2, 'Đồng hồ thông minh Samsung Galaxy Watch6', 'dong-ho-thong-minh-samsung-galaxy-watch6', 6990000.00, NULL, 7, 'products/qFjvgBw8Fwh2doYTrBs3FHhWKhbq07VTds8BAuvA.jpg', 'Đồng hồ thông minh Samsung Galaxy Watch6. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:09:51', NULL),
	(21, 3, 4, 'Tai nghe Sony WH-1000XM5', 'tai-nghe-sony-wh-1000xm5-21', 9990000.00, NULL, 8, 'products/j2f68Rc9Pfn8cFzwRxpIcVzRfyYvong8SPbjEgJG.webp', 'Tai nghe chống ồn không dây Sony WH-1000XM5. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:15:24', NULL),
	(22, 3, 6, 'Tai nghe Xiaomi Redmi Buds 5', 'tai-nghe-xiaomi-redmi-buds-5', 1090000.00, NULL, 20, 'products/78mpPIvAyJa6sxT3SvG5DaRhvNN668hZtAbFJn9h.webp', 'Tai nghe true wireless Xiaomi Redmi Buds 5. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:07:56', NULL),
	(23, 3, 8, 'Chuột không dây Logitech MX Master 3S', 'chuot-khong-day-logitech-mx-master-3s', 2490000.00, NULL, 10, 'products/XQiueRGyI33UG1HnNndGAJRUCqTJ17sb8qqaR4Vx.jpg', 'Chuột không dây Logitech MX Master 3S. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:04:39', NULL),
	(24, 3, 10, 'Tai nghe Bowers & Wilkins Px7 S2e', 'tai-nghe-bowers-wilkins-px7-s2e-24', 8490000.00, NULL, 5, 'products/dH8XfuwtWC926OcVIfN5P2zQ1eOLgDAGO6mRTgVj.webp', 'Tai nghe chụp tai Bowers & Wilkins Px7 S2e. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:02:36', NULL),
	(25, 3, 11, 'Loa Bluetooth JBL Flip 6', 'loa-bluetooth-jbl-flip-6', 2690000.00, NULL, 20, 'products/060iDCEDsJi3YFd3DaiTcgxzBARlBMjsHrba7wnJ.jpg', 'Loa Bluetooth JBL Flip 6 chống nước. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:03:08', NULL),
	(26, 3, 12, 'Sạc dự phòng Anker 20000mAh', 'sac-du-phong-anker-20000mah-26', 1590000.00, NULL, 15, 'products/UW0GkIdb22LiOVngfiTbqBWzz1JVcnY12r8MDv41.jpg', 'Pin sạc dự phòng Anker dung lượng 20000mAh. Không áp dụng khuyến mãi.', 1, '2026-11-01 10:27:54', '2026-11-01 19:08:18', NULL),
	(34, 3, 8, 'Apple Magic Keyboard', 'apple-magic-keyboard', 2790000.00, NULL, 6, 'products/fbHVCJllscZiWGsKTPQmnCtFt4kXAzcSDmdHUK6b.jpg', 'Apple Magic Keyboard, không giảm giá.', 1, '2026-11-01 10:32:51', '2026-11-01 18:57:47', NULL),
	(35, 6, 2, 'Samsung Galaxy Watch6', 'samsung-galaxy-watch6', 6990000.00, NULL, 8, 'products/dYDQmD8pdBl844dSj1sw21zQjyhSPM8jUJAxwx8k.jpg', 'Samsung Galaxy Watch6, không giảm giá.', 1, '2026-11-01 10:32:51', '2026-11-01 23:58:45', NULL),
	(36, 3, 12, 'Tai nghe Bowers & Wilkins Px7 S2e', 'tai-nghe-bowers-wilkins-px7-s2e', 8490000.00, NULL, 5, 'products/IsoB5FAj9SztIhr5ljas7g5Hdm1CxfwxhbI4Fxg7.webp', 'Tai nghe Bowers & Wilkins Px7 S2e, không giảm giá.', 1, '2026-11-01 10:32:51', '2026-11-01 18:56:35', NULL),
	(37, 3, 6, 'Loa JBL Flip 6', 'loa-jbl-flip-6', 2690000.00, NULL, 12, 'products/Pw6JxMiA4tiCkP3njn92ZhidBLAXRUgaJyuK8oRC.jpg', 'Loa JBL Flip 6, không giảm giá.', 1, '2026-11-01 10:32:51', '2026-11-01 18:57:17', NULL),
	(38, 3, 11, 'Sạc dự phòng Anker 20000mAh', 'sac-du-phong-anker-20000mah', 1590000.00, NULL, 15, 'products/qSBOyhCGt3i6FvLJBKmyvrNu1nfVMk2AEMr1Oo5k.jpg', 'Sạc dự phòng Anker 20000mAh, không giảm giá.', 1, '2026-11-01 10:32:51', '2026-11-01 18:59:30', NULL);

-- Dumping structure for table thltw_minhhien_ngocman_24e.product_favorites
CREATE TABLE IF NOT EXISTS `product_favorites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_favorites_user_id_product_id_unique` (`user_id`,`product_id`),
  KEY `product_favorites_product_id_foreign` (`product_id`),
  CONSTRAINT `product_favorites_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_favorites_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.product_favorites: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.product_reactions
CREATE TABLE IF NOT EXISTS `product_reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `reaction` enum('like','dislike') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_reactions_user_id_product_id_unique` (`user_id`,`product_id`),
  KEY `product_reactions_product_id_foreign` (`product_id`),
  CONSTRAINT `product_reactions_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.product_reactions: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.product_reviews
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_reviews_product_id_user_id_unique` (`product_id`,`user_id`),
  KEY `product_reviews_user_id_foreign` (`user_id`),
  KEY `product_reviews_status_index` (`status`),
  CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.product_reviews: ~0 rows (approximately)
INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `rating`, `comment`, `image_path`, `created_at`, `updated_at`, `status`) VALUES
	(1, 7, 3, 5, '.', NULL, '2026-11-01 08:53:06', '2026-11-01 08:53:06', 'approved'),
	(2, 35, 10, 5, 'san pham tot', NULL, '2026-11-01 23:03:38', '2026-11-01 23:03:38', 'pending');

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

-- Dumping structure for table thltw_minhhien_ngocman_24e.static_pages
CREATE TABLE IF NOT EXISTS `static_pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `static_pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.static_pages: ~0 rows (approximately)

-- Dumping structure for table thltw_minhhien_ngocman_24e.stock_movements
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `movement_type` enum('in','out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int unsigned NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_movements_product_id_created_at_index` (`product_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.stock_movements: ~1 rows (approximately)
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `reason`, `admin_id`, `created_at`, `updated_at`) VALUES
	(1, 35, 'in', 3, 'them san pham', 3, '2026-11-01 23:58:45', '2026-11-01 23:58:45');

-- Dumping structure for table thltw_minhhien_ngocman_24e.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `pass` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'member',
  `status` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.user: ~10 rows (approximately)
INSERT INTO `user` (`id`, `username`, `email`, `pass`, `phone`, `address`, `avatar`, `role`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'admin', 'admin@example.com', '$2y$12$R.Smsl35h8iQlyp6Jd6sIuJ6e2oYmS0PClR5wly0G/i.Gv1.pmeC2', '0901234567', 'TP. Hồ Chí Minh', NULL, 'admin', 1, '2026-09-28 02:46:30', '2026-09-28 11:45:09', NULL),
	(2, 'nguyenvana', 'vana@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.X2g1aM3aW', '0987654321', 'Hà Nội', NULL, 'member', 1, '2026-09-28 02:46:30', '2026-09-28 02:46:30', NULL),
	(3, 'admin_test', 'admintest@example.com', '$2y$12$MxhCdemc64QsUq2I2qu3t.W98T4WVyAeBRUStnmb.DplfsWHlv4Wa', '0909999888', 'TP. Hồ Chí Minh', NULL, 'admin', 1, '2026-09-28 04:46:32', '2026-09-28 04:46:32', NULL),
	(4, 'superadmin', 'superadmin@myshop.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0900000001', 'Quận 1, TP.HCM', NULL, 'super_admin', 1, '2026-10-12 11:02:25', '2026-10-12 11:02:25', NULL),
	(5, 'admin_hien', 'admin1@myshop.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0900000002', 'Quận 3, TP.HCM', NULL, 'admin', 1, '2026-10-12 11:02:25', '2026-10-12 11:02:25', NULL),
	(6, 'nguyenvanb', 'nguyenvana@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', '123 Đường Lê Lợi, Q1, TP.HCM', NULL, 'member', 1, '2026-10-12 11:02:25', '2026-10-12 11:02:25', NULL),
	(7, 'tranthib', 'tranthib@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912345678', '456 Đường Nguyễn Huệ, Q1, TP.HCM', NULL, 'member', 1, '2026-10-12 11:02:25', '2026-10-12 11:02:25', NULL),
	(8, 'lehoangc', 'lehoangc@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0987654321', '789 Đường CMT8, Q3, TP.HCM', NULL, 'member', 0, '2026-10-12 11:02:25', '2026-10-12 11:02:25', NULL),
	(9, 'LeTranMinhHien', 'dinoboy6556@gmail.com', '$2y$12$.G4e52rMTe4YG8aFonwREeGAEcHCwK0TXrIkbqJQPNywHePY72pfq', '09093337702', '288/9 Dương Đình Hội', NULL, 'member', 1, '2026-11-01 09:24:33', '2026-11-01 09:26:50', NULL),
	(10, 'MinhHien', 'hienhoingao123@gmail.com', '$2y$12$nywapz5rW3yg0S1HaDn12uEPAORQCjQbXJ/aIdP.B6KGmobY.SlBa', '0909267802', NULL, NULL, 'member', 1, '2026-11-01 22:40:09', '2026-11-01 22:40:09', NULL);

-- Dumping structure for table thltw_minhhien_ngocman_24e.website_settings
CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `website_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table thltw_minhhien_ngocman_24e.website_settings: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
