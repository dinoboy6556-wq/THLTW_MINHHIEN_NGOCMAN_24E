"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import productService from "@/services/productService";
import { getErrorMessage } from "@/lib/axios";
import { addToCart } from "@/lib/cart";

const formatPrice = (price) => Number(price || 0).toLocaleString("vi-VN");

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        const response = await productService.getById(slug);
        const productData = response.data?.data;

        if (!productData) {
          throw new Error("Không tìm thấy sản phẩm.");
        }

        if (isMounted) setProduct(productData);
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(loadProduct);

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleAddToCart = () => {
    if (addToCart(product, quantity)) {
      setAdded(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <main className="min-h-[60vh] px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh."}
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Quay lại cửa hàng
        </Link>
      </main>
    );
  }

  const salePrice = product.sale_price ?? product.promo_price;
  const hasDiscount = salePrice && Number(salePrice) < Number(product.price);
  const stock = Math.max(0, Number(product.stock || 0));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-indigo-600">
            Sản phẩm
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white p-6 sm:min-h-[480px]">
            {product.thumbnail ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.thumbnail}
                alt={product.name}
                className="max-h-[440px] w-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <span className="text-6xl" aria-hidden="true">
                  📦
                </span>
                <p className="mt-3 text-sm">Sản phẩm chưa có ảnh</p>
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-700">
              {product.category?.name && <span>{product.category.name}</span>}
              {product.brand?.name && <span>· {product.brand.name}</span>}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Mã sản phẩm: {product.slug}
            </p>

            <div className="mt-6 border-y border-gray-100 py-5">
              {hasDiscount ? (
                <>
                  <p className="text-3xl font-bold text-red-600">
                    {formatPrice(salePrice)} đ
                  </p>
                  <p className="mt-1 text-sm text-gray-400 line-through">
                    {formatPrice(product.price)} đ
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)} đ
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${stock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <span className={stock > 0 ? "text-emerald-700" : "text-red-600"}>
                {stock > 0 ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}
              </span>
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-900">
                  Mô tả sản phẩm
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-auto pt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 items-center rounded-lg border border-gray-300">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="h-full w-11 text-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    disabled={quantity >= stock}
                    onClick={() =>
                      setQuantity((current) => Math.min(stock, current + 1))
                    }
                    className="h-full w-11 text-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={stock === 0}
                  onClick={handleAddToCart}
                  className="h-12 flex-1 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </button>
              </div>
              {added && (
                <p className="mt-3 text-sm text-emerald-700" role="status">
                  Đã thêm vào giỏ hàng. {" "}
                  <Link href="/cart" className="font-semibold underline">
                    Xem giỏ hàng
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}