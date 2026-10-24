"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getArticleBySlug, mapPostToArticle } from "@/data/articles";
import postService from "@/services/postService";

export default function PostDetailPage() {
  const { slug } = useParams();
  return <PostDetail key={slug} slug={slug} />;
}

function PostDetail({ slug }) {
  const [article, setArticle] = useState(() => getArticleBySlug(slug) || null);
  const [loading, setLoading] = useState(() => !getArticleBySlug(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const existingArticle = getArticleBySlug(slug);

    if (existingArticle) {
      return () => {
        isMounted = false;
      };
    }

    postService
      .getPublishedBySlug(slug)
      .then((response) => {
        if (isMounted) {
          setArticle(mapPostToArticle(response.data.data));
        }
      })
      .catch((error) => {
        console.error("Lỗi tải bài viết:", error);
        if (isMounted) {
          setNotFound(true);
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
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-gray-500">
        Đang tải bài viết...
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Không tìm thấy bài viết
        </h1>
        <Link href="/posts" className="font-semibold text-indigo-600">
          Quay lại danh sách bài viết
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/posts" className="hover:text-indigo-600">
            Bài viết
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{article.title}</span>
        </nav>

        <header className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div
            className={`flex h-56 items-center justify-center bg-gradient-to-br sm:h-80 ${article.coverClass || "from-indigo-500 to-blue-400"}`}
            style={
              article.coverImage
                ? { backgroundImage: `url("${article.coverImage}")`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!article.coverImage && (
              <span className="text-8xl drop-shadow-lg" aria-hidden="true">
                {article.icon || "📝"}
              </span>
            )}
          </div>
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {article.category}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {article.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-5 text-sm text-gray-500">
              <time>{article.publishedAt}</time>
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        <div className="mt-8 rounded-3xl bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          <div className="space-y-8">
            {article.sections
              ? article.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-xl font-bold text-gray-900">
                      {section.heading}
                    </h2>
                    <div className="mt-3 space-y-4 text-base leading-8 text-gray-700">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))
              : article.content
                  ?.split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className="whitespace-pre-line text-base leading-8 text-gray-700"
                    >
                      {paragraph}
                    </p>
                  ))}
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6">
            <Link
              href="/posts"
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Quay lại tất cả bài viết
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
