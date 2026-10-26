"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { mapPostToArticle } from "@/data/articles";
import postService from "@/services/postService";

export default function PostsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let isMounted = true;

    postService
      .getPublished()
      .then((response) => {
        if (!isMounted) return;

        setArticles((response.data?.data || []).map(mapPostToArticle));
      })
      .catch((error) => {
        console.error("Lỗi tải bài viết:", error);
        if (isMounted) {
          setApiError("Không thể tải bài viết từ máy chủ.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Bài viết</span>
        </nav>

        <header className="mb-10 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-500 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
            MYSHOP · GÓC CÔNG NGHỆ
          </p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Bài viết &amp; tư vấn công nghệ
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-indigo-100">
            Cập nhật mẹo sử dụng thiết bị, kinh nghiệm chọn mua và những thông
            tin công nghệ hữu ích dành cho bạn.
          </p>
        </header>

        {apiError && (
          <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {apiError}
          </p>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Bài viết mới nhất
          </h2>
          <span className="text-sm text-gray-500">
            {articles.length} bài viết
          </span>
        </div>

        {loading ? (
          <p className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">
            Đang tải bài viết...
          </p>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          !apiError && (
            <p className="rounded-xl bg-white p-8 text-center text-sm text-gray-500">
              Hiện chưa có bài viết được xuất bản.
            </p>
          )
        )}
      </div>
    </main>
  );
}
