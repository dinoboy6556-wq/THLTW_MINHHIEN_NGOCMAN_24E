import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">MYSHOP E-COMMERCE</h3>
          <p className="text-slate-400 leading-relaxed">
            Hệ thống bán lẻ thiết bị công nghệ hàng đầu. Đảm bảo chất lượng và uy tín dịch vụ.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Liên kết nhanh</h4>
          <ul className="space-y-2">
            <li><Link href="/products" className="hover:text-white transition">Tất cả sản phẩm</Link></li>
            <li><Link href="/categories" className="hover:text-white transition">Danh mục nổi bật</Link></li>
            <li><Link href="/cart" className="hover:text-white transition">Giỏ hàng của bạn</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Liên hệ support</h4>
          <p>Email: support@myshop.com</p>
          <p className="mt-1">Hotline: 1900 1234</p>
          <p className="mt-1">Địa chỉ: TP. Hồ Chí Minh, Việt Nam</p>
        </div>
      </div>

      <div className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        © {new Date().getFullYear()} MYSHOP. All rights reserved.
      </div>
    </footer>
  );
}