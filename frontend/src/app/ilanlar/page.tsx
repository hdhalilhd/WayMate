"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AddressInput from "@/components/AddressInput";
import CitySelect from "@/components/CitySelect";
import type { ListingDto, LocationDto } from "@/types";
import { MapPin, Clock, Users, ChevronRight, Search, SlidersHorizontal, Car, Navigation } from "lucide-react";
import VerifiedBadges from "@/components/VerifiedBadges";
import { useLangCtx } from "@/components/Providers";
import { t } from "@/lib/i18n";
import SaveSearchBanner from "@/components/SaveSearchBanner";
import { DISTRICTS } from "@/lib/districts";

type SearchMode = "city" | "route" | "nearby";

export default function IlanlarPage() {
  const router = useRouter();
  const { lang } = useLangCtx();
  const [mode, setMode] = useState<SearchMode>("city");

  // city mode
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  // route mode
  const [home, setHome] = useState<LocationDto | null>(null);
  const [work, setWork] = useState<LocationDto | null>(null);
  const [radius, setRadius] = useState(500);

  const [listings, setListings] = useState<ListingDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locating, setLocating] = useState(false);

  const availableDistricts = city ? (DISTRICTS[city] ?? []) : [];

  async function searchByCity(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const { data } = await api.get<ListingDto[]>("/listings/by-city", {
        params: { city: city || undefined, district: district || undefined },
      });
      setListings(data);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  async function searchByRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!home || !work) return;
    setSearching(true);
    try {
      const { data } = await api.get<ListingDto[]>("/listings/search", {
        params: {
          riderHomeLat: home.lat, riderHomeLng: home.lng,
          riderWorkLat: work.lat, riderWorkLng: work.lng,
          city: city || undefined,
          radiusMeters: radius,
        },
      });
      setListings(data);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  function searchNearby() {
    if (!navigator.geolocation) { alert("Tarayıcınız konum özelliğini desteklemiyor."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await api.get<ListingDto[]>("/listings/nearby", {
            params: { lat: pos.coords.latitude, lng: pos.coords.longitude, radiusMeters: 5000 },
          });
          setListings(data);
          setSearched(true);
          setMode("nearby");
        } finally { setLocating(false); }
      },
      () => { setLocating(false); alert("Konumunuza erişilemedi. Tarayıcı izinlerini kontrol edin."); }
    );
  }

  const tabs: { key: SearchMode; label: string; icon: React.ReactNode }[] = [
    { key: "city",  label: "Şehir / İlçe",   icon: <MapPin className="w-4 h-4" /> },
    { key: "route", label: "A → B Güzergah", icon: <Car className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-14">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">{t(lang, "findRide")}</h1>
          <p className="text-teal-100 text-base max-w-xl">{t(lang, "findRidePage")}</p>
        </div>
      </div>

      {/* Search panel */}
      <div className="bg-white border-b border-gray-100 shadow-md -mt-6 mx-4 lg:mx-auto max-w-5xl rounded-2xl relative z-10">
        <div className="px-5 pt-5 pb-1">
          {/* Tab seçici */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  mode === tab.key
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Şehir / İlçe modu */}
          {mode === "city" && (
            <form onSubmit={searchByCity} className="space-y-3 pb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <CitySelect value={city} onChange={(v) => { setCity(v); setDistrict(""); }} placeholder="İl seç (zorunlu değil)" />
                </div>
                {availableDistricts.length > 0 && (
                  <div className="flex-1">
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="input"
                    >
                      <option value="">Tüm ilçeler</option>
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={searching} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  <Search className="w-4 h-4" />
                  {searching ? "Aranıyor..." : "İlanları Listele"}
                </button>
                <button
                  type="button"
                  onClick={searchNearby}
                  disabled={locating}
                  className="flex items-center gap-1.5 border border-teal-400 text-teal-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {locating ? "Konum alınıyor..." : "Yakınımdaki"}
                </button>
              </div>
            </form>
          )}

          {/* Güzergah modu */}
          {mode === "route" && (
            <form onSubmit={searchByRoute} className="space-y-3 pb-5">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <AddressInput label="" placeholder="Ev adresin (nereden?)" iconColor="text-green-500" value={home} onChange={setHome} />
                </div>
                <div className="flex-1">
                  <AddressInput label="" placeholder="İş adresin (nereye?)" iconColor="text-red-400" value={work} onChange={setWork} />
                </div>
              </div>
              {/* Yarıçap slider */}
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                    <span className="font-medium">{t(lang, "radius")}</span>
                  </div>
                  <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full">
                    {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
                  </span>
                </div>
                <input
                  type="range" min={100} max={1000} step={50} value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((radius - 100) / 900) * 100}%, #e5e7eb ${((radius - 100) / 900) * 100}%, #e5e7eb 100%)` }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>100m</span><span>250m</span><span>500m</span><span>750m</span><span>1 km</span>
                </div>
              </div>
              <button type="submit" disabled={!home || !work || searching} className="btn-primary flex items-center gap-2 w-full justify-center">
                <Search className="w-4 h-4" />
                {searching ? "Aranıyor..." : t(lang, "searchBtn")}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
        {/* Sonuç başlığı + dekoratif görsel */}
        {searched && (
          <div className="relative mb-8">
            {/* Dekoratif arka alan */}
            <div className="absolute -inset-4 -right-8 top-0 w-80 h-48 pointer-events-none">
              <svg viewBox="0 0 400 300" className="w-full h-full opacity-40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="decorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle cx="200" cy="80" r="120" fill="url(#decorGradient)" />
                <circle cx="300" cy="180" r="90" fill="url(#decorGradient)" opacity="0.6" />
              </svg>
            </div>

            {/* Başlık içeriği */}
            <div className="relative z-10">
              <h2 className="font-bold text-gray-900 text-lg">
                {listings.length} ilan bulundu
                {city && <span className="text-teal-600"> · {city}</span>}
                {district && <span className="text-teal-500"> / {district}</span>}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {mode === "nearby" ? "📍 Konumunuza yakın ilanlar (5km)" :
                 mode === "city" ? (city ? `${city}${district ? ` › ${district}` : ""} ilanları` : "Tüm ilanlar") :
                 `Güzergah eşleşmesi · Yarıçap: ${radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}`}
              </p>
            </div>
          </div>
        )}

        {/* Boş durumlar */}
        {!searched && (
          <div className="text-center py-20 text-gray-400">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Yol arkadaşı bul</h3>
            <p className="text-sm">Şehir seç ya da güzergahını girerek ara.</p>
          </div>
        )}

        {searched && listings.length === 0 && mode === "route" && home && work && (
          <div className="max-w-md mx-auto">
            <SaveSearchBanner city={city} home={home} work={work} radius={radius} />
            <p className="text-center text-sm text-gray-400 mt-4">
              veya{" "}
              <button onClick={() => router.push("/ilan-olustur")} className="text-teal-600 font-medium hover:underline">
                kendin ilan ver →
              </button>
            </p>
          </div>
        )}

        {searched && listings.length === 0 && mode !== "route" && (
          <div className="text-center py-16">
            <Car className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="font-semibold text-gray-500">İlan bulunamadı</p>
            <p className="text-sm text-gray-400 mt-1">Farklı bir şehir veya ilçe deneyin.</p>
          </div>
        )}

        {/* Kartlar */}
        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l.id} onClick={() => router.push(`/ilan?id=${l.id}`)}
              className="card p-5 cursor-pointer hover:border-teal-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl shrink-0">
                  {l.driverName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-base">{l.driverName}</p>
                        {l.city && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{l.city}{l.district ? ` / ${l.district}` : ""}</span>}
                        <VerifiedBadges email={l.driverEmailVerified} tc={l.driverTcVerified} />
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-400" />{l.morningDepartTime.slice(0, 5)}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-teal-400" />{l.availableSeats} koltuk</span>
                        <span className="text-xs text-gray-400">Sapma: {l.deviationRadiusMeters >= 1000 ? `${l.deviationRadiusMeters / 1000}km` : `${l.deviationRadiusMeters}m`}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-teal-600">₺{Math.round(l.pricePerTrip * 22)}</p>
                      <p className="text-xs text-gray-400">/ ay</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <span className="text-gray-600 truncate">{l.homeLocation.addressText}</span>
                    </div>
                    <div className="w-8 h-px bg-gray-300 shrink-0" />
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span className="text-gray-600 truncate">{l.workLocation.addressText}</span>
                    </div>
                  </div>

                  {l.homeDistanceMeters !== null && l.homeDistanceMeters !== undefined && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                        ~{Math.round(l.homeDistanceMeters)}m uzakta
                      </span>
                      {l.flexibilityNote && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{l.flexibilityNote}</span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-400 transition-colors shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
