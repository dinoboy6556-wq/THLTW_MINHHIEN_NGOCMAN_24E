import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { articles } from "@/data/articles";

export default function PostsPage() {
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

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Bài viết mới nhất
          </h2>
          <span className="text-sm text-gray-500">
            {articles.length} bài viết
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </main>
  );
}
