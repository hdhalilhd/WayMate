"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Mail, CheckCircle, LogIn } from "lucide-react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { LocationDto } from "@/types";

interface Props {
  city?: string;
  home: LocationDto;
  work: LocationDto;
  radius: number;
}

export default function SaveSearchBanner({ city, home, work, radius }: Props) {
  const router = useRouter();
  const user = getUser();
  const [saved, setSaved] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);
  const [loading, setLoading] = useState(false);

  async function saveSearch() {
    if (!user) { router.push("/giris"); return; }
    setLoading(true);
    try {
      await api.post("/savedsearches", {
        city: city || null,
        homeLat: home.lat, homeLng: home.lng,
        homeAddressText: home.addressText,
        workLat: work.lat, workLng: work.lng,
        workAddressText: work.addressText,
        radiusMeters: radius,
        emailNotify,
      });
      setSaved(true);
    } catch {
      alert("Arama kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">Arama Kaydedildi!</h3>
        <p className="text-sm text-gray-500 mb-2">
          Bu güzergah için yeni ilan eklendiğinde{emailNotify ? " e-posta ve" : ""} site bildirimi alacaksın.
        </p>
        <button
          onClick={() => setSaved(false)}
          className="text-sm text-teal-600 hover:underline mt-1"
        >
          Ayarları değiştir
        </button>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Üst renkli bant */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-400 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base">Bu güzergahta henüz ilan yok</p>
            <p className="text-teal-100 text-sm">Yeni ilan eklenince bildirim al</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Güzergah özeti */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
          <p className="flex items-center gap-2 text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="truncate">{home.addressText}</span>
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="truncate">{work.addressText}</span>
          </p>
          {city && (
            <p className="text-xs text-teal-600 font-medium mt-1">📍 {city} · {radius >= 1000 ? `${radius/1000}km` : `${radius}m`} yarıçap</p>
          )}
        </div>

        {/* E-posta toggle */}
        <button
          type="button"
          onClick={() => setEmailNotify(!emailNotify)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
            emailNotify
              ? "border-teal-400 bg-teal-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Mail className={`w-5 h-5 ${emailNotify ? "text-teal-500" : "text-gray-400"}`} />
            <div className="text-left">
              <p className={`text-sm font-medium ${emailNotify ? "text-teal-700" : "text-gray-600"}`}>
                E-posta bildirimi
              </p>
              <p className="text-xs text-gray-400">{user?.email ?? "Giriş yapınca aktif olur"}</p>
            </div>
          </div>
          {emailNotify
            ? <Bell className="w-5 h-5 text-teal-500" />
            : <BellOff className="w-5 h-5 text-gray-300" />}
        </button>

        {/* Kaydet butonu */}
        {user ? (
          <button
            onClick={saveSearch}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {loading ? "Kaydediliyor..." : "Bildirim Kur"}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => router.push("/giris")}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap ve Bildirim Kur
            </button>
            <p className="text-xs text-center text-gray-400">
              Bildirim almak için ücretsiz hesap oluşturman gerekiyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
