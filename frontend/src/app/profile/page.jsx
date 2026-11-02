"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

const emptyProfile = { username: "", email: "", phone: "", address: "" };

export default function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!localStorage.getItem("access_token")) {
        if (isMounted) {
          setError("Bạn cần đăng nhập để xem hồ sơ.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/me");
        const user = response.data?.user || {};
        if (isMounted) {
          const loadedProfile = {
            username: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
          };
          setProfile(loadedProfile);
          setSavedProfile(loadedProfile);
          setAvatarUrl(user.avatar_url || "");
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Không tải được hồ sơ. Vui lòng đăng nhập lại.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    queueMicrotask(loadProfile);
    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let response;
      if (avatarFile) {
        const formData = new FormData();
        Object.entries(profile).forEach(([key, value]) => formData.append(key, value));
        formData.append("avatar", avatarFile);
        formData.append("_method", "PUT");
        response = await api.post("/profile", formData);
      } else {
        response = await api.put("/profile", profile);
      }
      const updatedUser = response.data?.user || profile;
      const savedUserProfile = {
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      };
      setProfile(savedUserProfile);
      setSavedProfile(savedUserProfile);
      setAvatarUrl(updatedUser.avatar_url || "");
      setAvatarFile(null);
      setAvatarPreview("");
      setIsEditing(false);
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      setSuccess(response.data?.message || "Đã lưu hồ sơ của bạn.");
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      setError(
        validationErrors
          ? Object.values(validationErrors).flat()[0]
          : requestError.response?.data?.message || "Không thể lưu hồ sơ.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">
            Tài khoản của bạn
          </p>
          <h1 className="mt-2 text-3xl font-bold">Hồ sơ cá nhân</h1>
          <p className="mt-2 text-sm text-indigo-100">
            Quản lý thông tin liên hệ dùng cho đơn hàng.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          {loading ? (
            <p className="py-8 text-center text-slate-500">Đang tải hồ sơ...</p>
          ) : error && !profile.email ? (
            <div className="rounded-2xl bg-red-50 p-5 text-center text-red-700">
              <p>{error}</p>
              <Link
                href="/login?redirect=/profile"
                className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
              >
                Đăng nhập
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              {success && (
                <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-5 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                      {avatarPreview || avatarUrl ? (
                        <img src={avatarPreview || avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                      ) : (
                        profile.username?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="block font-semibold text-slate-800">Ảnh đại diện</span>
                      <span className="mt-1 block text-sm text-slate-500">JPG, PNG hoặc WebP, tối đa 2 MB</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-200" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Tên người dùng</span>
                    <input name="username" value={profile.username} onChange={updateField} required maxLength={50} autoComplete="username" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                    <input type="email" name="email" value={profile.email} onChange={updateField} required maxLength={100} autoComplete="email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Số điện thoại</span>
                    <input type="tel" name="phone" value={profile.phone} onChange={updateField} maxLength={20} autoComplete="tel" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Địa chỉ</span>
                    <textarea name="address" value={profile.address} onChange={updateField} maxLength={1000} rows={3} autoComplete="street-address" className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  </label>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                      {saving ? "Đang lưu..." : "Lưu hồ sơ"}
                    </button>
                    <button type="button" disabled={saving} onClick={() => { setProfile(savedProfile); setAvatarFile(null); setAvatarPreview(""); setError(""); setIsEditing(false); }} className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="mb-7 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                      ) : (
                        profile.username?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{profile.username}</p>
                      <p className="text-sm text-slate-500">Ảnh đại diện</p>
                    </div>
                  </div>
                  {[
                    ["Tên người dùng", profile.username],
                    ["Email", profile.email],
                    ["Số điện thoại", profile.phone],
                    ["Địa chỉ", profile.address],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 border-b border-slate-100 pb-4 sm:grid-cols-[180px_1fr] sm:gap-4">
                      <span className="text-sm font-semibold text-slate-500">{label}</span>
                      <span className="break-words font-medium text-slate-800">{value || "Chưa cập nhật"}</span>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3 pt-3">
                    <button type="button" onClick={() => { setError(""); setSuccess(""); setIsEditing(true); }} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700">
                      Chỉnh sửa hồ sơ
                    </button>
                    <Link href="/orders" className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                      Xem đơn hàng
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
