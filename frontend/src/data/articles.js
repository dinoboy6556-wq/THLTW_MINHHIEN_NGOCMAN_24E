export function mapPostToArticle(post) {
  const wordCount = post.content?.trim().split(/\s+/).filter(Boolean).length || 0;

  return {
    ...post,
    excerpt: post.excerpt || "",
    category: post.category || "Bài viết",
    publishedAt: post.published_at
      ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(
          new Date(post.published_at),
        )
      : "",
    readTime: `${Math.max(1, Math.ceil(wordCount / 200))} phút đọc`,
    icon: "📝",
    coverClass: "from-indigo-500 to-blue-400",
    coverImage: post.cover_image || "",
  };
}
