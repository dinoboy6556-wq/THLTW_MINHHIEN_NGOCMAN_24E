-- Run after the project's categories, brands, and products tables exist.
-- Adds eight sample products with no sale price (promo_price = NULL).
-- Images are left NULL so the UI can use its fallback until real files are added.

START TRANSACTION;

-- Remove any invalid promotion where the sale price is higher than the regular price.
UPDATE products
SET promo_price = NULL,
    updated_at = NOW()
WHERE promo_price > price;

-- Ensure all sample brands exist. Slugs make this safe to run more than once.
INSERT INTO brands (name, slug, logo, description, status)
SELECT samples.name, samples.slug, NULL, 'Thương hiệu thiết bị công nghệ', 1
FROM (
    SELECT 'Sony' AS name, 'sony' AS slug UNION ALL
    SELECT 'JBL', 'jbl' UNION ALL
    SELECT 'Logitech', 'logitech' UNION ALL
    SELECT 'Anker', 'anker' UNION ALL
    SELECT 'Xiaomi', 'xiaomi' UNION ALL
    SELECT 'Samsung', 'samsung' UNION ALL
    SELECT 'Apple', 'apple' UNION ALL
    SELECT 'Bowers & Wilkins', 'bowers-wilkins'
) AS samples
WHERE NOT EXISTS (
    SELECT 1 FROM brands WHERE brands.slug = samples.slug
);

-- Use the active technology accessories category when present; otherwise use
-- the first active category so the sample import still works on a fresh database.
INSERT INTO products (
    cate_id,
    brand_id,
    name,
    slug,
    price,
    promo_price,
    stock,
    thumbnail,
    description,
    status,
    created_at,
    updated_at
)
SELECT
    COALESCE(
        (SELECT id FROM categories
         WHERE status = 1 AND deleted_at IS NULL
           AND (slug = 'phu-kien-cong-nghe' OR name = 'Phụ kiện công nghệ')
         ORDER BY id LIMIT 1),
        (SELECT id FROM categories
         WHERE status = 1 AND deleted_at IS NULL
         ORDER BY id LIMIT 1)
    ),
    brands.id,
    samples.name,
    samples.slug,
    samples.price,
    NULL,
    samples.stock,
    NULL,
    samples.description,
    1,
    NOW(),
    NOW()
FROM (
    SELECT 'Tai nghe Sony WH-1000XM5' AS name, 'tai-nghe-sony-wh-1000xm5-sample' AS slug,
           'sony' AS brand_slug, 9990000 AS price, 8 AS stock,
           'Tai nghe chống ồn không dây Sony WH-1000XM5. Không áp dụng khuyến mãi.' AS description
    UNION ALL SELECT 'Loa Bluetooth JBL Flip 6', 'loa-bluetooth-jbl-flip-6-sample', 'jbl', 2690000, 12,
           'Loa Bluetooth JBL Flip 6 chống nước. Không áp dụng khuyến mãi.'
    UNION ALL SELECT 'Chuột không dây Logitech MX Master 3S', 'chuot-logitech-mx-master-3s-sample', 'logitech', 2490000, 10,
           'Chuột không dây Logitech MX Master 3S. Không áp dụng khuyến mãi.'
    UNION ALL SELECT 'Sạc dự phòng Anker 20000mAh', 'sac-du-phong-anker-20000mah-sample', 'anker', 1590000, 15,
           'Pin sạc dự phòng Anker dung lượng 20000mAh. Không áp dụng khuyến mãi.'
    UNION ALL SELECT 'Tai nghe Xiaomi Redmi Buds 5', 'tai-nghe-xiaomi-redmi-buds-5-sample', 'xiaomi', 1090000, 20,
           'Tai nghe true wireless Xiaomi Redmi Buds 5. Không áp dụng khuyến mãi.'
    UNION ALL SELECT 'Đồng hồ thông minh Samsung Galaxy Watch6', 'dong-ho-samsung-galaxy-watch6-sample', 'samsung', 6990000, 7,
           'Đồng hồ thông minh Samsung Galaxy Watch6. Không áp dụng khuyến mãi.'
    UNION ALL SELECT 'Bàn phím Apple Magic Keyboard', 'ban-phim-apple-magic-keyboard-sample', 'apple', 2790000, 6,
           'Bàn phím Apple Magic Keyboard kết nối Bluetooth. Không áp dụng khuyến mãi.'
    UNION ALL SELECT 'Tai nghe Bowers & Wilkins Px7 S2e', 'tai-nghe-bowers-wilkins-px7-s2e-sample', 'bowers-wilkins', 8490000, 5,
           'Tai nghe chụp tai Bowers & Wilkins Px7 S2e. Không áp dụng khuyến mãi.'
) AS samples
JOIN brands ON brands.slug = samples.brand_slug
WHERE brands.status = 1
  AND brands.deleted_at IS NULL
  AND COALESCE(
      (SELECT id FROM categories
       WHERE status = 1 AND deleted_at IS NULL
         AND (slug = 'phu-kien-cong-nghe' OR name = 'Phụ kiện công nghệ')
       ORDER BY id LIMIT 1),
      (SELECT id FROM categories
       WHERE status = 1 AND deleted_at IS NULL
       ORDER BY id LIMIT 1)
  ) IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM products WHERE products.slug = samples.slug
  );

COMMIT;
