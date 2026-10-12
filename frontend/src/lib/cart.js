// src/lib/cart.js

export const addToCart = (product, quantityToAdd = 1) => {
  // Tránh lỗi crash khi chạy trên Server (SSR)
  if (typeof window === 'undefined') return;

  try {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = currentCart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantityToAdd;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        promo_price: product.promo_price,
        thumbnail: product.thumbnail,
        stock: product.stock,
        quantity: quantityToAdd,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Phát sự kiện thông báo để Navbar/Header cập nhật số dư giỏ hàng ngay lập tức
    window.dispatchEvent(new Event('cartUpdated'));
    
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  } catch (error) {
    console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error);
  }
};