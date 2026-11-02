import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-4 py-16">
      <section className="max-w-lg rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-7xl font-black text-indigo-100">404</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Đường dẫn có thể đã thay đổi hoặc nội dung không còn tồn tại.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Về trang chủ</Link>
          <Link href="/products" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Xem sản phẩm</Link>
        </div>
      </section>
    </main>
  );
}
