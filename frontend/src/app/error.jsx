"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, retry }) {
  useEffect(() => {
    console.error("Lỗi giao diện MyShop:", error);
  }, [error]);

  return (
    <main className="flex min-h-[65vh] items-center justify-center px-4 py-16">
      <section className="max-w-lg rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <span className="text-5xl" aria-hidden="true">⚠️</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Trang này chưa thể hiển thị. Bạn có thể thử tải lại hoặc quay về cửa hàng.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Thử lại</button>
          <Link href="/" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Về trang chủ</Link>
        </div>
      </section>
    </main>
  );
}
