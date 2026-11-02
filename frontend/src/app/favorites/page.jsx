"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import favoriteService from "@/services/favoriteService";
import productService from "@/services/productService";
import { getErrorMessage } from "@/lib/axios";

export default function FavoritesPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await favoriteService.getAll({ per_page: 100 });
      setProducts((response.data?.data?.data || []).map((favorite) => favorite.product).filter(Boolean));
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const remove = async (productId) => {
    try { await productService.removeFavorite(productId); await load(); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
  };

  return <main className="min-h-screen bg-gray-50 px-4 py-10"><div className="mx-auto max-w-7xl"><header className="mb-7"><h1 className="text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1><p className="mt-2 text-sm text-gray-500">Các sản phẩm bạn đã lưu để xem lại.</p></header>{error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{products.length === 0 ? <div className="rounded-xl border bg-white p-12 text-center text-gray-500">Chưa có sản phẩm yêu thích. <Link href="/products" className="font-semibold text-indigo-600">Khám phá sản phẩm</Link></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-xl border bg-white"><Link href={`/products/${product.slug || product.id}`}><div className="flex h-48 items-center justify-center bg-gray-50 p-4">{product.thumbnail ? <img src={product.thumbnail} alt={product.name} className="max-h-full max-w-full object-contain" /> : <span className="text-sm text-gray-400">Chưa có ảnh</span>}</div><div className="p-4"><h2 className="line-clamp-2 font-semibold text-gray-800">{product.name}</h2><p className="mt-2 font-bold text-indigo-700">{Number(product.promo_price || product.price).toLocaleString("vi-VN")} đ</p></div></Link><button type="button" onClick={() => remove(product.id)} className="m-4 mt-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Bỏ yêu thích</button></article>)}</div>}</div></main>;
}
