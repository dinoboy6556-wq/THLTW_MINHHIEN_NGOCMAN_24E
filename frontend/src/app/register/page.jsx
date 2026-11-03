"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api, { getErrorMessage } from "@/lib/axios";
import { setAuthSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/register", form);
      const data = response.data;

      setAuthSession(data.access_token, data.user);

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const returnPath =
        redirect?.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/";
      router.push(returnPath);
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      setError(
        validationErrors
          ? Object.values(validationErrors).flat()[0]
          : requestError.response?.data?.message || getErrorMessage(requestError),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-100 p-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">Tạo tài khoản</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Đăng ký tài khoản khách hàng để mua sắm tại MyShop.
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">
            Tên đăng nhập
            <input
              required
              minLength={3}
              maxLength={50}
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Email
            <input
              required
              type="email"
              maxLength={100}
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Số điện thoại <span className="font-normal text-gray-400">(không bắt buộc)</span>
            <input
              type="tel"
              maxLength={20}
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Mật khẩu
            <input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Nhập lại mật khẩu
            <input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={form.password_confirmation}
              onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
              className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            onClick={(event) => {
              const redirect = new URLSearchParams(window.location.search).get("redirect");
              if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
                event.preventDefault();
                router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
              }
            }}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
