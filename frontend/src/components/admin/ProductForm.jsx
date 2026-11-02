"use client";

import { useState, useEffect } from "react";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import brandService from "@/services/brandService";
import { getErrorMessage } from "@/lib/axios";

export default function ProductForm({ editingProduct, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    cate_id: "",
    brand_id: "",
    price: "",
    promo_price: "",
    stock: "",
    thumbnail: "",
    description: "",
    status: 1,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  // Hàm bóc tách Mảng an toàn
  const extractArray = (resData) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData.data)) return resData.data;
    if (resData.data && Array.isArray(resData.data.data))
      return resData.data.data;
    return [];
  };

  // 1. Tải danh sách Danh mục & Thương hiệu (Đã sửa lỗi ESLint)
  useEffect(() => {
    let isMounted = true;

    const loadDropdowns = async () => {
      try {
        const perPage = 100;
        const [firstCategoryPage, resBrand] = await Promise.all([
          categoryService.getAdminAll({ per_page: perPage, page: 1 }),
          brandService.getAll(),
        ]);
        const lastCategoryPage = Number(
          firstCategoryPage.data?.data?.last_page ?? 1,
        );
        const remainingCategoryPages = await Promise.all(
          Array.from({ length: Math.max(0, lastCategoryPage - 1) }, (_, index) =>
            categoryService.getAdminAll({ per_page: perPage, page: index + 2 }),
          ),
        );
        const allCategories = [
          ...extractArray(firstCategoryPage.data),
          ...remainingCategoryPages.flatMap((response) =>
            extractArray(response.data),
          ),
        ];

        if (isMounted) {
          setCategories(allCategories);
          setBrands(extractArray(resBrand.data));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Lỗi tải dropdown:", getErrorMessage(err));
          setCategories([]);
          setBrands([]);
        }
      }
    };

    loadDropdowns();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Điền dữ liệu cũ vào Form khi bấm Sửa (Dùng queueMicrotask để tránh setState đồng bộ)
  useEffect(() => {
    if (editingProduct) {
      queueMicrotask(() => {
        setFormData({
          name: editingProduct.name || "",
          cate_id: editingProduct.cate_id || "",
          brand_id: editingProduct.brand_id || "",
          price: editingProduct.price || "",
          promo_price: editingProduct.promo_price || "",
          stock: editingProduct.stock || "",
          thumbnail: editingProduct.thumbnail || "",
          description: editingProduct.description || "",
          status:
            editingProduct.status !== undefined
              ? Number(editingProduct.status)
              : 1,
        });
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      ...formData,
      cate_id: Number(formData.cate_id),
      brand_id: formData.brand_id ? Number(formData.brand_id) : null,
      price: Number(formData.price),
      promo_price: formData.promo_price ? Number(formData.promo_price) : null,
      stock: Number(formData.stock),
      status: Number(formData.status),
    };
    const payload = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      if (
        key === "thumbnail" &&
        (thumbnailFile ||
          (editingProduct && value === (editingProduct.thumbnail || "")))
      ) {
        return;
      }

      if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });

    if (thumbnailFile) {
      payload.append("thumbnail_file", thumbnailFile);
    }

    try {
      if (editingProduct) {
        payload.append("_method", "PUT");
        await productService.update(editingProduct.id, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await productService.create(payload);
        alert("Thêm sản phẩm mới thành công!");
      }
      onSuccess();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const categoryList = Array.isArray(categories) ? categories : [];
  const brandList = Array.isArray(brands) ? brands : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4"
    >
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="font-bold text-gray-800 text-lg">
          {editingProduct ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </h3>
        {editingProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:underline"
          >
            Hủy sửa
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên sản phẩm *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="VD: iPhone 15 Pro Max 256GB"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục *
          </label>
          <select
            name="cate_id"
            required
            value={formData.cate_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {categoryList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent?.name ? `${c.parent.name} / ` : ""}
                {c.name}
                {Number(c.status) === 0 ? " (Đang ẩn)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thương hiệu *
          </label>
          <select
            name="brand_id"
            required
            value={formData.brand_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brandList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá bán (VNĐ) *
          </label>
          <input
            type="number"
            name="price"
            required
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="34990000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá KM (VNĐ)
          </label>
          <input
            type="number"
            name="promo_price"
            min="0"
            value={formData.promo_price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="31990000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tồn kho *
          </label>
          <input
            type="number"
            name="stock"
            required
            min="0"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="15"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Ảnh đại diện (Thumbnail)
        </label>
        <input
          type="text"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://via.placeholder.com/400x400.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chọn ảnh từ máy
        </label>
        <input
          key={editingProduct?.id || "new-product"}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setThumbnailFile(file);
            setThumbnailPreview(file ? URL.createObjectURL(file) : "");
          }}
          className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="mt-1 text-xs text-gray-500">JPG, PNG hoặc WebP, tối đa 5 MB.</p>
        {(thumbnailPreview || formData.thumbnail) && (
          <img
            src={thumbnailPreview || formData.thumbnail}
            alt="Xem trước ảnh sản phẩm"
            className="mt-3 h-28 w-28 rounded-lg border border-gray-200 bg-gray-50 object-contain"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả sản phẩm
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Thông tin chi tiết..."
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trạng thái
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={1}>Mở bán (Hiển thị)</option>
          <option value={0}>Ẩn</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 font-medium py-2 rounded-lg text-white transition ${
            editingProduct
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading
            ? "Đang lưu..."
            : editingProduct
              ? "Lưu Thay Đổi"
              : "Thêm Sản Phẩm"}
        </button>

        {editingProduct && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
