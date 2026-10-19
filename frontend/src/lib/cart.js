// src/lib/cart.js

export const addToCart = (product, quantityToAdd = 1) => {
  if (typeof window === 'undefined') return false;

  try {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = currentCart.findIndex((item) => item.id === product.id);
    const existingQuantity = existingIndex > -1
      ? Number(currentCart[existingIndex].quantity) || 0
      : 0;
    const requestedQuantity = Math.max(1, Math.floor(Number(quantityToAdd) || 1));
    const stockLimit = product.stock == null ? Infinity : Number(product.stock);
    const nextQuantity = Math.min(existingQuantity + requestedQuantity, stockLimit);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= existingQuantity) {
      window.alert('Sản phẩm đã đạt số lượng tồn kho.');
      return false;
    }

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity = nextQuantity;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        promo_price: product.promo_price ?? product.sale_price ?? null,
        thumbnail: product.thumbnail,
        stock: product.stock,
        quantity: nextQuantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  } catch (error) {
    console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error);
    return false;
  }
};