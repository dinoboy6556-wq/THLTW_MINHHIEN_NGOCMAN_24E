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
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(false);

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

  useEffect(() => {
    if (!product?.id) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        setReviewLoading(true);
        setReviews([]);
        setReviewSummary({ average: 0, count: 0 });
      }
    });

    productService
      .getReviews(product.id)
      .then((response) => {
        if (!isMounted) return;
        setReviews(response.data?.data?.data || []);
        setReviewSummary(response.data?.summary || { average: 0, count: 0 });
      })
      .catch((requestError) => {
        console.error(
          "Lỗi tải đánh giá sản phẩm:",
          getErrorMessage(requestError),
        );
        if (isMounted) {
          setReviewError("Không thể tải đánh giá sản phẩm.");
        }
      })
      .finally(() => {
        if (isMounted) setReviewLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;

    let isMounted = true;
    const categoryId = product.category?.id;
    const brandId = product.brand?.id;

    const loadRelatedProducts = async () => {
      setRelatedLoading(true);
      setRelatedProducts([]);

      if (!categoryId && !brandId) {
        setRelatedLoading(false);
        return;
      }

      try {
        const response = await productService.getAll({
          per_page: 20,
          ...(categoryId ? { category_id: categoryId } : { brand_id: brandId }),
        });
        const responseData = response.data?.data;
        const products = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        if (isMounted) {
          setRelatedProducts(
            products.filter((item) => item.id !== product.id).slice(0, 4),
          );
        }
      } catch {
        if (isMounted) setRelatedProducts([]);
      } finally {
        if (isMounted) setRelatedLoading(false);
      }
    };

    queueMicrotask(loadRelatedProducts);
    return () => {
      isMounted = false;
    };
  }, [product]);

  const handleAddToCart = () => {
    if (addToCart(product, quantity)) {
      setAdded(true);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");

    if (!localStorage.getItem("access_token")) {
      setRequiresLogin(true);
      setReviewError("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }

    setRequiresLogin(false);
    setReviewSubmitting(true);
    try {
      await productService.submitReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      const response = await productService.getReviews(product.id);
      setReviews(response.data?.data?.data || []);
      setReviewSummary(response.data?.summary || { average: 0, count: 0 });
      setReviewComment("");
      setReviewMessage("Đánh giá của bạn đã được lưu.");
    } catch (requestError) {
      console.error(
        "Lỗi gửi đánh giá sản phẩm:",
        getErrorMessage(requestError),
      );
      setReviewError(getErrorMessage(requestError));
    } finally {
      setReviewSubmitting(false);
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
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-amber-500" aria-label={`${reviewSummary.average} trên 5 sao`}>
                {"★".repeat(Math.round(reviewSummary.average))}
                {"☆".repeat(5 - Math.round(reviewSummary.average))}
              </span>
              <span className="font-semibold text-gray-700">
                {reviewSummary.average.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({reviewSummary.count} đánh giá)
              </span>
            </div>

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

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Sản phẩm liên quan</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gợi ý thêm sản phẩm cùng danh mục để bạn dễ lựa chọn.
            </p>
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : relatedProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => {
                const itemSalePrice = item.sale_price ?? item.promo_price;
                const itemHasDiscount = itemSalePrice && Number(itemSalePrice) < Number(item.price);

                return (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-gray-100 transition hover:-translate-y-1 hover:shadow-lg">
                    <Link href={`/products/${item.slug || item.id}`} className="block">
                      <div className="flex h-40 items-center justify-center bg-gray-50 p-4">
                        {item.thumbnail ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.thumbnail} alt={item.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-sm text-gray-400">Chưa có ảnh</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="mt-2 font-bold text-indigo-700">
                          {formatPrice(itemHasDiscount ? itemSalePrice : item.price)} đ
                        </p>
                        {itemHasDiscount && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(item.price)} đ</p>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-500">
              Chưa có sản phẩm liên quan.
            </p>
          )}
        </section>

        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Đánh giá từ khách hàng
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {reviewSummary.count
                  ? `${reviewSummary.average.toFixed(1)}/5 từ ${reviewSummary.count} đánh giá`
                  : "Chưa có đánh giá. Hãy chia sẻ cảm nhận đầu tiên của bạn."}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 sm:p-6">
            {reviewLoading ? (
              <p className="text-sm text-gray-500">Đang tải đánh giá...</p>
            ) : reviews.length ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                          {review.user?.username?.charAt(0)?.toUpperCase() || "K"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-800">
                            {review.user?.username || "Khách hàng"}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {review.created_at
                              ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.created_at))
                              : ""}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm tracking-wide text-amber-500" aria-label={`${review.rating} sao`}>
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                      {review.comment}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Chưa có đánh giá từ khách hàng khác. Hãy là người đầu tiên chia sẻ trải nghiệm.
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-base font-bold text-gray-900">Chia sẻ đánh giá của bạn</h3>
          </div>
          <form onSubmit={handleSubmitReview} className="mt-4 max-w-2xl">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-800">
                Mức đánh giá
              </legend>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Chọn số sao">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={reviewRating === rating}
                    aria-label={`${rating} sao`}
                    onClick={() => setReviewRating(rating)}
                    className={`text-3xl transition ${
                      rating <= reviewRating
                        ? "text-amber-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block text-sm font-semibold text-gray-800">
              Nhận xét của bạn
              <textarea
                required
                maxLength={1000}
                rows={4}
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            {reviewError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {reviewError}
                {requiresLogin && (
                  <>
                    {" "}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`}
                      className="font-semibold underline"
                    >
                      Đăng nhập
                    </Link>
                    {" hoặc "}
                    <Link
                      href={`/register?redirect=${encodeURIComponent(`/products/${product.slug}`)}`}
                      className="font-semibold underline"
                    >
                      đăng ký
                    </Link>
                  </>
                )}
              </p>
            )}
            {reviewMessage && (
              <p className="mt-3 text-sm text-emerald-700" role="status">
                {reviewMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>

        </section>
      </div>
    </main>
  );
}
