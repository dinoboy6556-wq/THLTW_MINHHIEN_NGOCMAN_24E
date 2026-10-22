import Link from "next/link";

export default function ArticleCard({ article }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/posts/${article.slug}`} className="block">
        <div
          className={`flex h-48 items-center justify-center bg-gradient-to-br ${article.coverClass}`}
        >
          <span className="text-7xl drop-shadow-lg" aria-hidden="true">
            {article.icon}
          </span>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs">
            <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
              {article.category}
            </span>
            <span className="text-gray-500">{article.readTime}</span>
          </div>
          <h3 className="text-lg font-bold leading-snug text-gray-900 transition hover:text-indigo-600">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {article.excerpt}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
            <time>{article.publishedAt}</time>
            <span className="font-semibold text-indigo-600">Đọc bài viết →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
