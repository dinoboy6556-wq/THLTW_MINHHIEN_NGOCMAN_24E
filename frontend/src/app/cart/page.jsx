"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/axios";
import couponService from "@/services/couponService";

function VnpayInstructions() {
  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
      <div className="text-sm text-gray-700">
        <h3 className="font-bold text-gray-900">Thanh toán qua cổng VNPAY</h3>
        <p className="mt-2 text-xs leading-5 text-gray-600">
          Sau khi xác nhận đặt hàng, bạn sẽ được chuyển tới VNPAY để chọn chuyển khoản ngân hàng hoặc quét mã VNPAY-QR. Đơn hàng chỉ được ghi nhận đã thanh toán sau khi VNPAY xác nhận giao dịch.
        </p>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState({
    cus_name: "",
    cus_email: "",
    cus_phone: "",
    cus_address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderComplete, setOrderComplete] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);

  // 1. TẢI GIỎ HÀNG TỪ LOCALSTORAGE (Dùng queueMicrotask tránh lỗi setState đồng bộ)
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        const savedUser = JSON.parse(localStorage.getItem("user_info") || "{}");
        const hasAccessToken = Boolean(localStorage.getItem("access_token"));
        setIsLoggedIn(hasAccessToken);
        setIsCustomer(hasAccessToken && savedUser.role === "member");
        setCheckoutInfo({
          cus_name: savedUser.name || savedUser.username || "",
          cus_email: savedUser.email || "",
          cus_phone: savedUser.phone || "",
          cus_address: savedUser.address || "",
        });
      } catch (err) {
        console.error("Lỗi đọc giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (!payment) return;

    const orderCode = params.get("order_code");
    queueMicrotask(() => {
      if (payment === "success") {
        localStorage.removeItem("cart");
        setCartItems([]);
        window.dispatchEvent(new Event("cartUpdated"));
        setPaymentNotice({
          success: true,
          text: `VNPAY báo thanh toán thành công${orderCode ? ` cho đơn ${orderCode}` : ""}. Đơn hàng đang được hệ thống cập nhật.`,
        });
      } else {
        setPaymentNotice({
          success: false,
          text: "Thanh toán VNPAY chưa hoàn tất. Giỏ hàng của bạn vẫn được giữ lại để thử lại.",
        });
      }
    });

    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // 2. LƯU THAY ĐỔI VÀO LOCALSTORAGE
  const saveCartToStorage = (updatedCart) => {
    setCartItems(updatedCart);
    setAppliedCoupon(null);
    setCouponMessage("Giỏ hàng đã thay đổi. Hãy áp dụng lại mã ưu đãi.");
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Phát sự kiện để Header/Navbar tự cập nhật số lượng badge
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Cập nhật số lượng
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const maxStock = item.stock || 99;
        return { ...item, quantity: Math.min(newQuantity, maxStock) };
      }
      return item;
    });

    saveCartToStorage(updatedCart);
  };

  // Xóa 1 sản phẩm
  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    saveCartToStorage(updatedCart);
  };

  // Xóa toàn bộ giỏ hàng
  const handleClearCart = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?")) {
      saveCartToStorage([]);
    }
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (!isCustomer) {
      setCheckoutError("Vui lòng đăng nhập bằng tài khoản khách hàng để đặt hàng.");
      return;
    }

    setPlacingOrder(true);
    setCheckoutError("");

    try {
      const response = await api.post("/orders", {
        ...checkoutInfo,
        payment_method: paymentMethod,
        ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: Number(item.quantity),
        })),
      });

      const order = response.data?.data;
      if (!order) {
        throw new Error("Không nhận được thông tin đơn hàng.");
      }

      if (paymentMethod === "vnpay") {
        if (!order.payment_url) {
          throw new Error("Không nhận được liên kết thanh toán VNPAY.");
        }
        window.location.assign(order.payment_url);
        return;
      }

      setOrderComplete(order);
      saveCartToStorage([]);
      setShowCheckout(false);
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      setCheckoutError(
        validationErrors
          ? Object.values(validationErrors).flat()[0]
          : getErrorMessage(error),
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setCouponMessage("Vui lòng nhập mã giảm giá.");
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");
    try {
      const response = await couponService.validate(promoCode.trim(), subtotal);
      setAppliedCoupon(response.data?.data || null);
      setCouponMessage("Đã áp dụng mã giảm giá.");
    } catch (error) {
      setAppliedCoupon(null);
      setCouponMessage(getErrorMessage(error));
    } finally {
      setCouponLoading(false);
    }
  };

  // 3. TÍNH TOÁN CHI PHÍ
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.promo_price
      ? Number(item.promo_price)
      : Number(item.price || 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ
  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const discountAmount = Number(appliedCoupon?.discount_amount || 0);
  const total = Math.max(0, subtotal - discountAmount) + shippingFee;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {paymentNotice && (
          <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${paymentNotice.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            {paymentNotice.text} {paymentNotice.success && <Link href="/orders" className="font-semibold underline">Xem đơn hàng</Link>}
          </p>
        )}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý các sản phẩm bạn đã chọn trước khi tiến hành thanh toán
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {orderComplete ? (
          <section className="bg-white rounded-xl p-8 sm:p-12 text-center border border-emerald-100 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
              ✓
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Đặt hàng thành công
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Mã đơn hàng <strong>{orderComplete.order_code}</strong>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Tổng thanh toán: <strong>{Number(orderComplete.total_amount).toLocaleString("vi-VN")} đ</strong>
            </p>
            {orderComplete.payment_method === "vnpay" ? (
              <p className="mt-3 text-sm text-gray-500">Thanh toán VNPAY đang chờ xác nhận.</p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                Đơn hàng đang chờ xác nhận. Bạn thanh toán khi nhận hàng.
              </p>
            )}
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Tiếp tục mua sắm
            </Link>
          </section>
        ) : cartItems.length === 0 ? (
          /* ================= GIỎ HÀNG RỖNG ================= */
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl">
              🛒
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              Hãy chọn thêm các sản phẩm công nghệ chất lượng cao từ cửa hàng
              của chúng tôi.
            </p>
            <Link
              href="/products"
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm shadow-md shadow-indigo-600/20"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          /* ================= GIAO DIỆN CHÍNH 2 CỘT ================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 grid grid-cols-12 gap-4 uppercase">
                  <span className="col-span-6">Sản phẩm</span>
                  <span className="col-span-3 text-center">Số lượng</span>
                  <span className="col-span-3 text-right">Thành tiền</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const price = item.promo_price
                      ? Number(item.promo_price)
                      : Number(item.price || 0);
                    const itemTotal = price * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition"
                      >
                        {/* Ảnh & Tên sản phẩm */}
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                            {item.thumbnail ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-xs text-gray-400">
                                No img
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <Link
                              href={`/products/${item.slug || item.id}`}
                              className="font-semibold text-gray-800 text-sm hover:text-indigo-600 transition line-clamp-1"
                            >
                              {item.name}
                            </Link>

                            <div className="text-xs text-gray-500 mt-1">
                              {item.promo_price ? (
                                <span className="text-red-600 font-semibold">
                                  {Number(item.promo_price).toLocaleString(
                                    "vi-VN",
                                  )}{" "}
                                  đ{" "}
                                  <span className="text-gray-400 line-through text-[10px] font-normal">
                                    {Number(item.price).toLocaleString("vi-VN")}{" "}
                                    đ
                                  </span>
                                </span>
                              ) : (
                                <span>
                                  {Number(item.price).toLocaleString("vi-VN")} đ
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-left text-xs text-red-500 hover:underline mt-1 w-fit"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* Bộ điều khiển số lượng */}
                        <div className="col-span-3 flex items-center justify-center">
                          <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 transition text-sm font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 transition text-sm font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Tổng giá mục */}
                        <div className="col-span-3 text-right">
                          <span className="font-bold text-gray-900 text-sm">
                            {itemTotal.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Link
                  href="/products"
                  className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1"
                >
                  &larr; Tiếp tục tìm sản phẩm khác
                </Link>
              </div>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6 sticky top-6">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-3">
                  Tóm Tắt Đơn Hàng
                </h2>

                {/* Mã giảm giá */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mã ưu đãi / Khuyến mãi
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (appliedCoupon) {
                          setAppliedCoupon(null);
                          setCouponMessage("Mã đã thay đổi. Hãy áp dụng lại.");
                        }
                      }}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-xl text-xs transition"
                    >
                      {couponLoading ? "Đang kiểm tra..." : "Áp dụng"}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`mt-2 text-xs ${appliedCoupon ? "text-emerald-700" : "text-amber-700"}`} role="status">
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Bảng chi tiết chi phí */}
                <div className="flex flex-col gap-3 text-sm border-t border-b py-4">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Tạm tính ({cartItems.reduce((a, b) => a + b.quantity, 0)}{" "}
                      sản phẩm)
                    </span>
                    <span className="font-semibold text-gray-800">
                      {subtotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Mã giảm giá {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}</span>
                    <span className="font-semibold text-emerald-700">−{discountAmount.toLocaleString("vi-VN")} đ</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold text-gray-800">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600">Miễn phí</span>
                      ) : (
                        `${shippingFee.toLocaleString("vi-VN")} đ`
                      )}
                    </span>
                  </div>

                  {shippingFee > 0 && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg">
                      💡 Mua thêm{" "}
                      <b>{(1000000 - subtotal).toLocaleString("vi-VN")} đ</b> để
                      được <b>Miễn phí vận chuyển</b>!
                    </p>
                  )}
                </div>

                {/* Tổng tiền thanh toán */}
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-extrabold text-indigo-600">
                    {total.toLocaleString("vi-VN")} đ
                  </span>
                </div>

                {/* Nút thanh toán */}
                {isCustomer ? (
                  <button
                    onClick={() => {
                      setCheckoutError("");
                      setShowCheckout(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 text-center text-sm"
                  >
                    TIẾN HÀNH THANH TOÁN
                  </button>
                ) : isLoggedIn ? (
                  <p className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                    Chỉ tài khoản khách hàng mới được đặt hàng.
                  </p>
                ) : (
                  <Link
                    href="/login?redirect=/cart"
                    className="block w-full rounded-xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
                  >
                    ĐĂNG NHẬP ĐỂ ĐẶT HÀNG
                  </Link>
                )}

                {/* Cam kết mua sắm */}
                <div className="flex flex-col gap-2 pt-2 border-t text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>🛡️</span>{" "}
                    <span>Thanh toán an toàn & bảo mật 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🚚</span> <span>Giao hàng tận nơi toàn quốc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCheckout(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 id="checkout-title" className="text-xl font-bold text-gray-900">
                  Thông tin thanh toán
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tổng cộng {total.toLocaleString("vi-VN")} đ, gồm phí giao hàng.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng checkout"
                onClick={() => setShowCheckout(false)}
                className="text-xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCheckout} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                Họ và tên
                <input
                  required
                  maxLength={100}
                  name="cus_name"
                  value={checkoutInfo.cus_name}
                  onChange={(event) => setCheckoutInfo((current) => ({ ...current, cus_name: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                  <input
                    required
                    type="email"
                    maxLength={100}
                    name="cus_email"
                    value={checkoutInfo.cus_email}
                    onChange={(event) => setCheckoutInfo((current) => ({ ...current, cus_email: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Số điện thoại
                  <input
                    required
                    type="tel"
                    maxLength={20}
                    name="cus_phone"
                    value={checkoutInfo.cus_phone}
                    onChange={(event) => setCheckoutInfo((current) => ({ ...current, cus_phone: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <label className="text-sm font-medium text-gray-700">
                Địa chỉ giao hàng
                <textarea
                  required
                  maxLength={1000}
                  rows={2}
                  name="cus_address"
                  value={checkoutInfo.cus_address}
                  onChange={(event) => setCheckoutInfo((current) => ({ ...current, cus_address: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <fieldset className="mt-1">
                <legend className="mb-2 text-sm font-semibold text-gray-800">
                  Phương thức thanh toán
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${paymentMethod === "cod" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 accent-indigo-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">Thanh toán khi nhận</span>
                      <span className="mt-1 block text-xs text-gray-500">Trả tiền trực tiếp cho đơn vị giao hàng.</span>
                    </span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${paymentMethod === "vnpay" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={() => setPaymentMethod("vnpay")}
                      className="mt-1 accent-indigo-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">Chuyển khoản / QR qua VNPAY</span>
                      <span className="mt-1 block text-xs text-gray-500">Thanh toán trên cổng VNPAY bằng ngân hàng hoặc mã QR.</span>
                    </span>
                  </label>
                </div>
                {paymentMethod === "vnpay" && (
                  <VnpayInstructions />
                )}
              </fieldset>

              {checkoutError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {checkoutError}
                </p>
              )}

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-2 h-12 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
              >
                {placingOrder ? "Đang tạo đơn hàng..." : `Xác nhận đặt hàng · ${total.toLocaleString("vi-VN")} đ`}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
