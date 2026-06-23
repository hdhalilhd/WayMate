"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { ListingDto, MatchRequestDto } from "@/types";
import { MapPin, Clock, Users, Car, ArrowLeft, MessageSquare, Star, CheckCircle, Flag, CalendarDays, ChevronRight } from "lucide-react";
import VerifiedBadges from "@/components/VerifiedBadges";
import ReportModal from "@/components/ReportModal";

function IlanDetayInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const user = getUser();
  const [listing, setListing] = useState<ListingDto | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) api.get<ListingDto>(`/listings/${id}`).then((r) => setListing(r.data));
  }, [id]);

  async function sendRequest() {
    if (!user) { router.push("/giris"); return; }
    setSending(true); setError("");
    try {
      await api.post<MatchRequestDto>("/matchrequests", {
        listingId: id,
        initialMessage: message || null,
      });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || "İstek gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isOwner = user?.userId === listing.userId;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Geri dön
          </button>
          {!isOwner && (
            <button onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
              <Flag className="w-4 h-4" /> Şikayet et
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Listing Details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Driver Card */}
            <div className="card p-6">
              <Link href={`/kullanici?id=${listing.userId}`} className="flex items-center gap-4 mb-6 group">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl group-hover:bg-teal-200 transition-colors shrink-0">
                  {listing.driverName[0]}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors truncate">{listing.driverName}</h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <VerifiedBadges email={listing.driverEmailVerified} tc={listing.driverTcVerified} size="md" />
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      listing.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {listing.status === "Active" ? "İlan Aktif" : "Pasif"}
                    </span>
                  </div>
                  <p className="text-xs text-teal-600 mt-1.5 font-medium flex items-center gap-0.5">
                    Profili gör <ChevronRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </Link>

              {/* Route */}
              <div className="relative pl-6 space-y-4 border-l-2 border-dashed border-gray-200 ml-2">
                <div className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white shadow" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nereden</p>
                  <p className="text-gray-800 font-medium">{listing.homeLocation.addressText}</p>
                </div>
                <div className="absolute -left-2 bottom-0 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-white shadow" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nereye</p>
                  <p className="text-gray-800 font-medium">{listing.workLocation.addressText}</p>
                </div>
              </div>

              {/* İlan tarihi */}
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-400">
                <CalendarDays className="w-3.5 h-3.5" />
                {new Date(listing.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde yayınlandı
              </div>
            </div>

            {/* Details Grid */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Yolculuk Detayları</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Clock className="w-4 h-4 text-teal-400" />, label: "Sabah Kalkış", value: listing.morningDepartTime.slice(0, 5) },
                  { icon: <Clock className="w-4 h-4 text-gray-300" />, label: "Akşam Dönüş", value: listing.eveningDepartTime.slice(0, 5) },
                  { icon: <Users className="w-4 h-4 text-teal-400" />, label: "Müsait Koltuk", value: `${listing.availableSeats} kişi` },
                  { icon: <Car className="w-4 h-4 text-teal-400" />, label: "Esneklik", value: listing.flexibilityDaysPct > 0 ? `%${listing.flexibilityDaysPct}` : "Sabit program" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {listing.flexibilityNote && (
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Esneklik Notu</p>
                  <p className="text-sm text-amber-800">{listing.flexibilityNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Price + Action */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <div className="text-center mb-5 pb-5 border-b border-gray-100">
                <p className="text-3xl font-extrabold text-teal-600">₺{Math.round(listing.pricePerTrip * 22)}</p>
                <p className="text-sm text-gray-400 mt-1">aylık (22 iş günü)</p>
                <p className="text-xs text-gray-400 mt-0.5">≈ ₺{listing.pricePerTrip.toFixed(1)} / gün</p>
              </div>

              {isOwner ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Bu sizin ilanınız</p>
                  <Link href="/profil" className="btn-outline w-full text-sm py-2.5 text-center block">
                    İlanlarımı Gör
                  </Link>
                </div>
              ) : listing.status === "Active" ? (
                sent ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-teal-500" />
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">İstek Gönderildi!</p>
                    <p className="text-xs text-gray-500">Sürücü sizi onayladığında bildirim alacaksınız.</p>
                    <Link href="/mesajlar" className="btn-primary w-full text-center block mt-4 text-sm py-2.5">
                      Mesajlarıma Git
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs">
                        {error}
                      </div>
                    )}
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Kendinizden kısaca bahsedin... (isteğe bağlı)"
                      rows={3}
                      maxLength={500}
                      className="input text-sm resize-none"
                    />
                    <button
                      onClick={sendRequest}
                      disabled={sending}
                      className="btn-primary w-full text-sm py-3"
                    >
                      {sending ? "Gönderiliyor..." : "Yolculuk İsteği Gönder"}
                    </button>
                    {!user && (
                      <p className="text-xs text-center text-gray-400">
                        <Link href="/giris" className="text-teal-600 font-medium">Giriş yap</Link> veya{" "}
                        <Link href="/kayit" className="text-teal-600 font-medium">kayıt ol</Link>
                      </p>
                    )}
                  </div>
                )
              ) : (
                <p className="text-center text-sm text-gray-400 py-3">Bu ilan şu an aktif değil.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal
          reportedUserId={listing.userId}
          listingId={listing.id}
          targetName={listing.driverName}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

export default function IlanDetayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    }>
      <IlanDetayInner />
    </Suspense>
  );
}
