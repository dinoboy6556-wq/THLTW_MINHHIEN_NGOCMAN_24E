"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import categoryService from "@/services/categoryService";
import { getErrorMessage } from "@/lib/axios";

const extractCategories = (resData) => {
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.data?.data)) return resData.data.data;
  return [];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll({ flat: true });
        if (isMounted) setCategories(extractCategories(response.data));
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err));
        console.error("Lỗi tải danh mục:", getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(loadCategories);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-900 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Danh mục sản phẩm
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Khám phá sản phẩm theo danh mục bạn quan tâm
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            Không thể tải danh mục: {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-gray-500">
            Chưa có danh mục nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {category.name}
                  </h2>
                  {category.parent?.name && (
                    <p className="mt-1 text-xs font-medium text-indigo-600">
                      Danh mục cha: {category.parent.name}
                    </p>
                  )}
                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Link
                    href={`/products?category_id=${category.id}`}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Xem sản phẩm
                  </Link>
                  {category.children?.map((child) => (
                    <Link
                      key={child.id}
                      href={`/products?category_id=${child.id}`}
                      className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
