"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car } from "lucide-react";
import api from "@/lib/api";
import { saveUser } from "@/lib/auth";
import type { User } from "@/types";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function GirisPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post<User>("/auth/login", form);
      saveUser(data);
      router.push("/ilanlar");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || "E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-cyan-400 items-center justify-center p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 rounded-2xl p-3">
              <Car className="w-8 h-8" />
            </div>
            <span className="text-3xl font-extrabold">WayMate</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 leading-tight">
            Her gün aynı güzergahı<br />paylaşanlarla buluş.
          </h2>
          <p className="text-teal-100 leading-relaxed">
            Yakıt masrafını böl, trafiğin stresini azalt,<br />yeni insanlar tanı.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Tekrar hoş geldin!</h1>
            <p className="text-gray-500 mt-1">Hesabına giriş yap.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-posta</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@mail.com" className="input" />
            </div>
            <div>
              <label className="label">Şifre</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">VEYA</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="mt-4">
            <GoogleSignInButton onError={(msg) => setError(msg)} />
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="text-teal-600 font-semibold hover:underline">
              Ücretsiz kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
