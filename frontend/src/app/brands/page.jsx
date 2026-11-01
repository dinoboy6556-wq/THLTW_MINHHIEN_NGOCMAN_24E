"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import brandService from "@/services/brandService";
import { getErrorMessage } from "@/lib/axios";
import BrandLogo from "@/components/BrandLogo";

const extractBrands = (resData) => {
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.data?.data)) return resData.data.data;
  return [];
};

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBrands = async () => {
      try {
        const response = await brandService.getAll();
        if (isMounted) setBrands(extractBrands(response.data));
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err));
        console.error("Lỗi tải thương hiệu:", getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(loadBrands);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-900 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Thương hiệu
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Khám phá sản phẩm từ những thương hiệu công nghệ yêu thích
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            Không thể tải thương hiệu: {error}
          </div>
        ) : brands.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-gray-500">
            Chưa có thương hiệu nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <article
                key={brand.id}
                className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <BrandLogo
                  name={brand.name}
                  src={brand.logo}
                  className="flex h-20 w-full items-center justify-center rounded-xl bg-indigo-50"
                  imageClassName="h-full w-full object-contain p-2"
                  fallbackClassName="text-xl font-bold text-indigo-600"
                />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {brand.name}
                  </h2>
                  {brand.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {brand.description}
                    </p>
                  )}
                  {brand.products_count != null && (
                    <p className="mt-2 text-xs text-gray-400">
                      {brand.products_count} sản phẩm
                    </p>
                  )}
                </div>
                <Link
                  href={`/products?brand_id=${brand.id}`}
                  className="mt-auto rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Xem sản phẩm
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
