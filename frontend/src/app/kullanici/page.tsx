"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { PublicProfileDto, ListingDto } from "@/types";
import { ArrowLeft, Car, Clock, Users, ChevronRight, CalendarDays, ShieldCheck } from "lucide-react";
import VerifiedBadges from "@/components/VerifiedBadges";

function KullaniciInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfileDto | null>(null);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); setNotFound(true); return; }
    Promise.all([
      api.get<PublicProfileDto>(`/users/${id}/public`),
      api.get<ListingDto[]>(`/listings/by-user/${id}`),
    ]).then(([p, l]) => {
      setProfile(p.data);
      setListings(l.data);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Users className="w-14 h-14 text-gray-200 mb-4" />
        <p className="font-semibold text-gray-600">Kullanıcı bulunamadı</p>
        <button onClick={() => router.back()} className="btn-outline mt-5 text-sm">Geri dön</button>
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Geri dön
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* Profil kartı */}
        <div className="card p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-3xl shrink-0">
              {profile.fullName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.fullName}</h1>
              <div className="mt-2">
                <VerifiedBadges email={profile.isEmailVerified} tc={profile.isTcVerified} size="md" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <CalendarDays className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Üyelik</p>
                <p className="font-semibold text-gray-800 text-sm">{memberSince}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Car className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Aktif ilan</p>
                <p className="font-semibold text-gray-800 text-sm">{profile.activeListingCount} ilan</p>
              </div>
            </div>
          </div>

          {profile.isVerified && (
            <div className="mt-4 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Onaylı üye
            </div>
          )}
        </div>

        {/* Aktif ilanları */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Aktif İlanları</h2>
          {listings.length === 0 ? (
            <div className="card p-8 text-center">
              <Car className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Şu an aktif ilanı yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((l) => (
                <div key={l.id} onClick={() => router.push(`/ilan?id=${l.id}`)}
                  className="card p-5 cursor-pointer hover:border-teal-200 transition-all group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      {l.city && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {l.city}{l.district ? ` / ${l.district}` : ""}
                        </span>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                          <span className="text-gray-600 truncate max-w-[120px]">{l.homeLocation.addressText}</span>
                        </div>
                        <div className="w-6 h-px bg-gray-300 shrink-0" />
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                          <span className="text-gray-600 truncate max-w-[120px]">{l.workLocation.addressText}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-400" />{l.morningDepartTime.slice(0, 5)}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-teal-400" />{l.availableSeats} koltuk</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-teal-600">₺{Math.round(l.pricePerTrip * 22)}</p>
                      <p className="text-xs text-gray-400">/ ay</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-400 transition-colors shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KullaniciPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    }>
      <KullaniciInner />
    </Suspense>
  );
}
