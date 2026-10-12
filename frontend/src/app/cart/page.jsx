"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");

  // 1. TẢI GIỎ HÀNG TỪ LOCALSTORAGE (Dùng queueMicrotask tránh lỗi setState đồng bộ)
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error("Lỗi đọc giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // 2. LƯU THAY ĐỔI VÀO LOCALSTORAGE
  const saveCartToStorage = (updatedCart) => {
    setCartItems(updatedCart);
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

  // 3. TÍNH TOÁN CHI PHÍ
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.promo_price
      ? Number(item.promo_price)
      : Number(item.price || 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ
  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

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

        {cartItems.length === 0 ? (
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
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        alert("Mã giảm giá không hợp lệ hoặc đã hết hạn!")
                      }
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-xl text-xs transition"
                    >
                      Áp dụng
                    </button>
                  </div>
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
                <button
                  onClick={() =>
                    alert(
                      "Chức năng Đặt hàng & Thanh toán sẽ được kết nối ở bước tiếp theo!",
                    )
                  }
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30 text-center text-sm"
                >
                  TIẾN HÀNH THANH TOÁN
                </button>

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
    </div>
  );
}
