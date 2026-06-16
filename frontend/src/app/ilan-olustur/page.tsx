"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import AddressInput from "@/components/AddressInput";
import type { LocationDto } from "@/types";
import { Clock, Users, ArrowLeft, CheckCircle } from "lucide-react";
import RouteMap from "@/components/RouteMap";
import CitySelect from "@/components/CitySelect";

export default function IlanOlusturPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [home, setHome] = useState<LocationDto | null>(null);
  const [work, setWork] = useState<LocationDto | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [form, setForm] = useState({
    morningDepartTime: "07:30",
    eveningDepartTime: "18:00",
    flexibilityNote: "",
    flexibilityDaysPct: 0,
    monthlyPrice: 1100,
    availableSeats: 1,
    deviationRadiusMeters: 500,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function nextStep() {
    if (step === 1 && !city) {
      setError("Lütfen şehir seçin."); return;
    }
    if (step === 1 && (!home || !work)) {
      setError("Lütfen ev ve iş adresini seçin."); return;
    }
    setError(""); setStep(step + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/listings", {
        city,
        homeLocation: home,
        workLocation: work,
        morningDepartTime: form.morningDepartTime,
        eveningDepartTime: form.eveningDepartTime,
        flexibilityNote: form.flexibilityNote || null,
        flexibilityDaysPct: Number(form.flexibilityDaysPct),
        pricePerTrip: Math.round((Number(form.monthlyPrice) / 22) * 100) / 100,
        availableSeats: Number(form.availableSeats),
        deviationRadiusMeters: Number(form.deviationRadiusMeters),
      });
      setDone(true);
    } catch {
      setError("İlan oluşturulamadı. Giriş yaptığınızdan emin olun.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">İlanın Yayında!</h2>
          <p className="text-gray-500 text-sm mb-8">
            İlanın yayınlandı. Araç arayanlar seninle iletişime geçebilir.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/mesajlar")} className="btn-primary w-full">
              Mesajlarıma Git
            </button>
            <button onClick={() => { setDone(false); setStep(1); setHome(null); setWork(null); }}
              className="btn-outline w-full text-sm">
              Yeni İlan Ver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-gray-900">İlan Ver</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                  {s === 1 ? "Güzergah" : "Detaylar"}
                </span>
                {s < 2 && <div className={`flex-1 h-px w-16 ${step > s ? "bg-teal-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Route */}
        {step === 1 && (
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Güzergahını Belirle</h2>
              <p className="text-sm text-gray-500">
                Ev ve iş adresini gir. Sistem, güzergahına uygun araç arayanları otomatik eşleştirecek.
              </p>
            </div>

            <div>
              <label className="label">Şehir</label>
              <CitySelect value={city} onChange={setCity} placeholder="Şehir seç..." required />
            </div>

            <AddressInput
              label="Ev Adresi"
              placeholder="Sabah nereden yola çıkıyorsun?"
              iconColor="text-green-500"
              value={home}
              onChange={setHome}
            />

            <AddressInput
              label="İş / Okul Adresi"
              placeholder="Her gün nereye gidiyorsun?"
              iconColor="text-red-400"
              value={work}
              onChange={setWork}
            />

            {home && work && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Rota Önizleme</p>
                  {routeInfo && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-semibold">
                        📍 {routeInfo.distanceKm} km
                      </span>
                      <span className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full">
                        🕐 ~{routeInfo.durationMin} dk
                      </span>
                    </div>
                  )}
                </div>
                <RouteMap origin={home} destination={work} onRouteInfo={setRouteInfo} />
              </div>
            )}

            <button onClick={nextStep} disabled={!home || !work} className="btn-primary w-full">
              Devam Et →
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Yolculuk Detayları</h2>
                <p className="text-sm text-gray-500">Saatler, fiyat ve esneklik bilgilerini gir.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" /> Sabah Kalkış
                  </label>
                  <input type="time" required value={form.morningDepartTime}
                    onChange={(e) => setForm({ ...form, morningDepartTime: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-300" /> Akşam Dönüş
                  </label>
                  <input type="time" required value={form.eveningDepartTime}
                    onChange={(e) => setForm({ ...form, eveningDepartTime: e.target.value })}
                    className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Aylık Ücret (₺)</label>
                  <div className="relative">
                    <input type="number" min={0} step={50} value={form.monthlyPrice}
                      onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                      className="input pr-16" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₺/ay</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-400">
                      Günlük: ≈ ₺{(form.monthlyPrice / 22).toFixed(1)}
                    </p>
                    {routeInfo && (
                      <p className="text-xs text-teal-600 font-medium">
                        {routeInfo.distanceKm} km · {routeInfo.durationMin} dk
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-400" /> Koltuk Sayısı
                  </label>
                  <select value={form.availableSeats}
                    onChange={(e) => setForm({ ...form, availableSeats: Number(e.target.value) })}
                    className="input">
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} koltuk</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sapma yarıçapı */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Yol Üzeri Sapma Mesafesi</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Rotandan en fazla ne kadar uzaktaki biriyle eşleşmek istersin?
                  </p>
                </div>
                <span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full whitespace-nowrap">
                  {form.deviationRadiusMeters >= 1000
                    ? `${form.deviationRadiusMeters / 1000} km`
                    : `${form.deviationRadiusMeters} m`}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={1000}
                step={50}
                value={form.deviationRadiusMeters}
                onChange={(e) => setForm({ ...form, deviationRadiusMeters: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((form.deviationRadiusMeters - 100) / 900) * 100}%, #e5e7eb ${((form.deviationRadiusMeters - 100) / 900) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>100m</span>
                <span>250m</span>
                <span>500m</span>
                <span>750m</span>
                <span>1 km</span>
              </div>
              <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-lg px-3 py-2">
                Bu değer, araç arayanın ev veya iş noktasının senin rotana olan maksimum uzaklığını belirler.
              </p>
            </div>

            <div className="card p-6 space-y-4">
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Esneklik</h2>
                <p className="text-sm text-gray-500">Saatlerin veya programın bazen değişiyor mu?</p>
              </div>
              <div>
                <label className="label">Esneklik Notu <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                <input type="text" maxLength={500}
                  placeholder="Örn: Ayda 3-5 gün saatlerim değişebilir"
                  value={form.flexibilityNote}
                  onChange={(e) => setForm({ ...form, flexibilityNote: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="label">Esneklik Oranı</label>
                <div className="bg-gray-50 rounded-xl p-4">
                  {/* Değer göstergesi */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Ne kadar esnek?</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      form.flexibilityDaysPct === 0
                        ? "bg-green-100 text-green-700"
                        : form.flexibilityDaysPct <= 15
                        ? "bg-amber-100 text-amber-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {form.flexibilityDaysPct === 0
                        ? "Sabit Program"
                        : `Ayda ~${Math.round(form.flexibilityDaysPct / 100 * 22)} gün esnek`}
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range" min={0} max={30} step={5}
                      value={form.flexibilityDaysPct}
                      onChange={(e) => setForm({ ...form, flexibilityDaysPct: Number(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(form.flexibilityDaysPct / 30) * 100}%, #e5e7eb ${(form.flexibilityDaysPct / 30) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>

                  {/* Etiketler */}
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    {[0, 5, 10, 15, 20, 25, 30].map((v) => (
                      <span
                        key={v}
                        className={`cursor-pointer transition-colors ${form.flexibilityDaysPct === v ? "text-teal-600 font-semibold" : ""}`}
                        onClick={() => setForm({ ...form, flexibilityDaysPct: v })}
                      >
                        %{v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                ← Geri
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Yayınlanıyor..." : "İlanı Yayınla 🚀"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
