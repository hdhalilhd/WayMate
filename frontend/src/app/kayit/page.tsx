"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { saveUser } from "@/lib/auth";
import type { User } from "@/types";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) { setError("Devam etmek için kullanıcı sözleşmesini kabul etmelisiniz."); return; }
    setError(""); setLoading(true);
    try {
      const { data } = await api.post<User>("/auth/register", { ...form, acceptedTerms });
      saveUser(data);
      router.push("/ilanlar");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || "Kayıt başarısız.");
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
          <h2 className="text-2xl font-bold mb-6 leading-tight">
            Ücretsiz kayıt ol,<br />hemen kullanmaya başla.
          </h2>
          <div className="space-y-3">
            {[
              "Kayıt ve kullanım tamamen ücretsiz",
              "Güzergahına uygun ilanları saniyeler içinde bul",
              "Güvenli mesajlaşma sistemi",
              "Dilediğinde ilanını durdur veya sil",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-teal-100">
                <CheckCircle className="w-4 h-4 text-white shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h1>
            <p className="text-gray-500 mt-1">Saniyeler içinde üye ol.</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Ad Soyad</label>
              <input type="text" required value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Adın ve soyadın" className="input" />
            </div>
            <div>
              <label className="label">E-posta</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@mail.com" className="input" />
            </div>
            <div>
              <label className="label">Telefon <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0530 000 00 00" className="input" />
            </div>
            <div>
              <label className="label">Şifre</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="En az 6 karakter" className="input" />
            </div>

            {/* Zorunlu sözleşme onayı */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-teal-500 shrink-0"
              />
              <span className="text-sm text-gray-600 leading-snug">
                <Link href="/sozlesme" target="_blank" className="text-teal-600 font-medium hover:underline">Kullanıcı Sözleşmesi</Link>'ni okudum, anladım ve kabul ediyorum.
              </span>
            </label>

            <button type="submit" disabled={loading || !acceptedTerms} className="btn-primary w-full py-3.5 mt-1">
              {loading ? "Kaydediliyor..." : "Ücretsiz Kayıt Ol"}
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
            Zaten hesabın var mı?{" "}
            <Link href="/giris" className="text-teal-600 font-semibold hover:underline">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
