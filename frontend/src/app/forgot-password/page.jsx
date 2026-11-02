"use client";

import Link from "next/link";
import { useState } from "react";
import api, { getErrorMessage } from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firstError = (requestError) => {
    const validationErrors = requestError.response?.data?.errors;
    return validationErrors
      ? Object.values(validationErrors).flat()[0]
      : requestError.response?.data?.message || getErrorMessage(requestError);
  };

  const sendCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (requestError) {
      setError(firstError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message);
      setPassword("");
      setPasswordConfirmation("");
      setCode("");
    } catch (requestError) {
      setError(firstError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-100 p-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">Quên mật khẩu</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          {step === 1
            ? "Nhập email đã đăng ký để nhận mã xác nhận."
            : "Nhập mã 6 số đã được gửi đến email của bạn."}
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="mb-4 rounded-xl border border-green-100 bg-green-50 p-3 text-sm font-medium text-green-700">
            {message}
            {step === 2 && (
              <span className="mt-1 block font-normal text-green-700">
                Nếu chưa nhận được thư, hãy kiểm tra thư mục Spam/Quảng cáo và chờ vài phút.
              </span>
            )}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={sendCode} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700">
              Email
              <input
                required
                type="email"
                maxLength={100}
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-50"
            >
              {loading ? "Đang gửi mã..." : "Gửi mã xác nhận"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700">
              Mã xác nhận
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-center text-lg tracking-[0.5em] text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="000000"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu mới
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Nhập lại mật khẩu mới
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-2.5 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => sendCode({ preventDefault: () => {} })}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              Gửi lại mã xác nhận
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Quay lại đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
