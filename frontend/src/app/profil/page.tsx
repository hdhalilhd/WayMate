"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { getUser, saveUser, clearUser } from "@/lib/auth";
import type { ListingDto, SavedSearchDto } from "@/types";
import {
  User, Lock, Car, MapPin, Clock, ChevronRight,
  CheckCircle, AlertCircle, Pencil, LogOut, Plus,
  ToggleLeft, ToggleRight, Bell, Mail, Trash2, ShieldCheck, BadgeCheck
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isTcVerified: boolean;
  createdAt: string;
}

type Tab = "profile" | "password" | "listings" | "searches" | "verification";

export default function ProfilPage() {
  const router = useRouter();
  const authUser = getUser();

  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<ListingDto[]>([]);
  const [searches, setSearches] = useState<SavedSearchDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  // E-posta doğrulama
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  // TC doğrulama
  const [tcForm, setTcForm] = useState({ tcNo: "", firstName: "", lastName: "", birthYear: "" });
  const [tcMsg, setTcMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [tcBusy, setTcBusy] = useState(false);

  async function sendEmailCode() {
    setEmailBusy(true); setEmailMsg(null);
    try {
      await api.post("/users/me/send-email-code");
      setEmailCodeSent(true);
      setEmailMsg({ type: "ok", text: "Kod e-posta adresine gönderildi. Gelen kutunu kontrol et." });
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEmailMsg({ type: "err", text: m || "Kod gönderilemedi." });
    } finally { setEmailBusy(false); }
  }

  async function verifyEmail() {
    setEmailBusy(true); setEmailMsg(null);
    try {
      await api.post("/users/me/verify-email", { code: emailCode.trim() });
      setProfile(p => p ? { ...p, isEmailVerified: true } : p);
      setEmailMsg({ type: "ok", text: "E-posta başarıyla doğrulandı! ✓" });
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setEmailMsg({ type: "err", text: m || "Doğrulama başarısız." });
    } finally { setEmailBusy(false); }
  }

  async function verifyTc(e: React.FormEvent) {
    e.preventDefault();
    setTcBusy(true); setTcMsg(null);
    try {
      await api.post("/users/me/verify-tc", {
        tcNo: tcForm.tcNo.trim(),
        firstName: tcForm.firstName.trim(),
        lastName: tcForm.lastName.trim(),
        birthYear: Number(tcForm.birthYear),
      });
      setProfile(p => p ? { ...p, isTcVerified: true } : p);
      setTcMsg({ type: "ok", text: "TC kimlik başarıyla doğrulandı! ✓" });
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setTcMsg({ type: "err", text: m || "Doğrulama başarısız." });
    } finally { setTcBusy(false); }
  }

  useEffect(() => {
    if (!authUser) { router.push("/giris"); return; }

    Promise.all([
      api.get<UserProfile>("/users/me"),
      api.get<ListingDto[]>("/listings/mine"),
      api.get<SavedSearchDto[]>("/savedsearches"),
    ]).then(([profileRes, listingsRes, searchesRes]) => {
      setProfile(profileRes.data);
      setProfileForm({ fullName: profileRes.data.fullName, phone: profileRes.data.phone || "" });
      setListings(listingsRes.data);
      setSearches(searchesRes.data);
    }).finally(() => setLoading(false));
  }, [authUser, router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg(null);
    try {
      const { data } = await api.put<UserProfile>("/users/me", profileForm);
      setProfile(data);
      // localStorage'daki user'ı da güncelle
      if (authUser) saveUser({ ...authUser, fullName: data.fullName });
      setProfileMsg({ type: "ok", text: "Bilgiler güncellendi." });
    } catch {
      setProfileMsg({ type: "err", text: "Güncelleme başarısız." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: "err", text: "Yeni şifreler eşleşmiyor." }); return;
    }
    setPwSaving(true); setPwMsg(null);
    try {
      await api.put("/users/me/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: "ok", text: "Şifre başarıyla güncellendi." });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setPwMsg({ type: "err", text: msg || "Şifre güncellenemedi." });
    } finally {
      setPwSaving(false);
    }
  }

  async function toggleListingStatus(listing: ListingDto) {
    const next = listing.status === "Active" ? "Paused" : "Active";
    await api.patch(`/listings/${listing.id}/status`, JSON.stringify(next), {
      headers: { "Content-Type": "application/json" },
    });
    setListings((prev) =>
      prev.map((l) => l.id === listing.id ? { ...l, status: next } : l)
    );
  }

  async function deleteSearch(id: string) {
    await api.delete(`/savedsearches/${id}`);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  async function deleteListing(id: string) {
    if (!confirm("Bu ilanı kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.")) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("İlan silinemedi. Lütfen tekrar deneyin.");
    }
  }

  function logout() { clearUser(); router.push("/"); }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Hesap Bilgileri", icon: <User className="w-4 h-4" /> },
    { key: "password", label: "Şifre Değiştir", icon: <Lock className="w-4 h-4" /> },
    { key: "verification", label: "Doğrulama", icon: <ShieldCheck className="w-4 h-4" /> },
    { key: "listings", label: `İlanlarım (${listings.length})`, icon: <Car className="w-4 h-4" /> },
    { key: "searches", label: `Bildirimlerim (${searches.length})`, icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        {/* Profile Header */}
        <div className="card p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl shrink-0">
            {profile?.fullName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">{profile?.fullName}</h1>
              {profile?.isVerified && (
                <CheckCircle className="w-5 h-5 text-teal-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Üye: {profile ? new Date(profile.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long" }) : ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" /> Çıkış
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="lg:w-56 shrink-0">
            <nav className="card overflow-hidden">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-left transition-colors border-b border-gray-50 last:border-0 ${
                    tab === t.key
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t.icon}
                  {t.label}
                  {tab === t.key && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── Hesap Bilgileri ─────────────────────────── */}
            {tab === "profile" && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Pencil className="w-4 h-4 text-teal-500" />
                  <h2 className="font-bold text-gray-900">Hesap Bilgilerini Düzenle</h2>
                </div>

                {profileMsg && (
                  <div className={`mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    profileMsg.type === "ok"
                      ? "bg-green-50 border border-green-100 text-green-700"
                      : "bg-red-50 border border-red-100 text-red-700"
                  }`}>
                    {profileMsg.type === "ok"
                      ? <CheckCircle className="w-4 h-4 shrink-0" />
                      : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {profileMsg.text}
                  </div>
                )}

                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="label">Ad Soyad</label>
                    <input
                      type="text" required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">E-posta</label>
                    <input
                      type="email" disabled value={profile?.email || ""}
                      className="input bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez.</p>
                  </div>
                  <div>
                    <label className="label">Telefon</label>
                    <input
                      type="tel"
                      placeholder="0530 000 00 00"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="input"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      İletişim bilgisi paylaşıldığında yol arkadaşın bu numarayı görecek.
                    </p>
                  </div>
                  <button type="submit" disabled={profileSaving} className="btn-primary w-full">
                    {profileSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Şifre Değiştir ─────────────────────────── */}
            {tab === "password" && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-4 h-4 text-teal-500" />
                  <h2 className="font-bold text-gray-900">Şifre Değiştir</h2>
                </div>

                {pwMsg && (
                  <div className={`mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    pwMsg.type === "ok"
                      ? "bg-green-50 border border-green-100 text-green-700"
                      : "bg-red-50 border border-red-100 text-red-700"
                  }`}>
                    {pwMsg.type === "ok"
                      ? <CheckCircle className="w-4 h-4 shrink-0" />
                      : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}

                <form onSubmit={changePassword} className="space-y-4">
                  <div>
                    <label className="label">Mevcut Şifre</label>
                    <input
                      type="password" required
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Yeni Şifre</label>
                    <input
                      type="password" required minLength={6}
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      placeholder="En az 6 karakter"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password" required
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      placeholder="••••••••"
                      className={`input ${
                        pwForm.confirm && pwForm.confirm !== pwForm.newPassword
                          ? "border-red-300 focus:ring-red-300"
                          : ""
                      }`}
                    />
                    {pwForm.confirm && pwForm.confirm !== pwForm.newPassword && (
                      <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor.</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={pwSaving || (!!pwForm.confirm && pwForm.confirm !== pwForm.newPassword)}
                    className="btn-primary w-full"
                  >
                    {pwSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Doğrulama ───────────────────────────────── */}
            {tab === "verification" && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                    <h2 className="font-bold text-gray-900">Hesap Doğrulama</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Doğrulanmış hesaplar daha güvenilirdir ve yol arkadaşları tarafından tercih edilir.
                  </p>
                </div>

                {/* E-POSTA */}
                <div className="card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">E-posta Doğrulama</p>
                        <p className="text-sm text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                    {profile?.isEmailVerified ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full shrink-0">
                        <BadgeCheck className="w-4 h-4" /> Doğrulandı
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full shrink-0">
                        Bekliyor
                      </span>
                    )}
                  </div>

                  {!profile?.isEmailVerified && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      {emailMsg && (
                        <div className={`mb-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
                          emailMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                          {emailMsg.type === "ok" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          {emailMsg.text}
                        </div>
                      )}
                      {!emailCodeSent ? (
                        <button onClick={sendEmailCode} disabled={emailBusy} className="btn-primary w-full sm:w-auto">
                          {emailBusy ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text" inputMode="numeric" maxLength={6}
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="6 haneli kod"
                            className="input sm:max-w-[160px] tracking-[0.3em] text-center font-bold"
                          />
                          <button onClick={verifyEmail} disabled={emailBusy || emailCode.length !== 6} className="btn-primary">
                            {emailBusy ? "..." : "Doğrula"}
                          </button>
                          <button onClick={sendEmailCode} disabled={emailBusy} className="text-sm text-gray-500 hover:text-teal-600 px-2">
                            Tekrar gönder
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* TC KİMLİK */}
                <div className="card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">TC Kimlik Doğrulama</p>
                        <p className="text-sm text-gray-500">Resmi NVI kayıtlarıyla doğrulanır</p>
                      </div>
                    </div>
                    {profile?.isTcVerified ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full shrink-0">
                        <BadgeCheck className="w-4 h-4" /> Doğrulandı
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full shrink-0">
                        Bekliyor
                      </span>
                    )}
                  </div>

                  {!profile?.isTcVerified && (
                    <form onSubmit={verifyTc} className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                      {tcMsg && (
                        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                          tcMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                          {tcMsg.type === "ok" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          {tcMsg.text}
                        </div>
                      )}
                      <div>
                        <label className="label">TC Kimlik No</label>
                        <input
                          type="text" inputMode="numeric" maxLength={11} required
                          value={tcForm.tcNo}
                          onChange={(e) => setTcForm({ ...tcForm, tcNo: e.target.value.replace(/\D/g, "") })}
                          placeholder="11 haneli TC no" className="input" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Ad</label>
                          <input type="text" required value={tcForm.firstName}
                            onChange={(e) => setTcForm({ ...tcForm, firstName: e.target.value })}
                            placeholder="Adın" className="input" />
                        </div>
                        <div>
                          <label className="label">Soyad</label>
                          <input type="text" required value={tcForm.lastName}
                            onChange={(e) => setTcForm({ ...tcForm, lastName: e.target.value })}
                            placeholder="Soyadın" className="input" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Doğum Yılı</label>
                        <input type="number" min={1900} max={2025} required value={tcForm.birthYear}
                          onChange={(e) => setTcForm({ ...tcForm, birthYear: e.target.value })}
                          placeholder="Örn: 1990" className="input sm:max-w-[160px]" />
                      </div>
                      <button type="submit" disabled={tcBusy} className="btn-primary w-full sm:w-auto">
                        {tcBusy ? "Doğrulanıyor..." : "Kimliğimi Doğrula"}
                      </button>
                      <p className="text-xs text-gray-400 flex items-start gap-1.5 pt-1">
                        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        Bilgilerin yalnızca NVI ile eşleştirme için kullanılır, TC numaran sistemde saklanmaz (KVKK).
                      </p>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* ── İlanlarım ───────────────────────────────── */}
            {tab === "listings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">İlanlarım</h2>
                  <Link href="/ilan-olustur" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Yeni İlan
                  </Link>
                </div>

                {listings.length === 0 ? (
                  <div className="card p-10 text-center">
                    <Car className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="font-medium text-gray-500 mb-2">Henüz ilanın yok</p>
                    <p className="text-sm text-gray-400 mb-5">İlan oluşturarak yol arkadaşı bulmaya başla.</p>
                    <Link href="/ilan-olustur" className="btn-primary inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> İlan Oluştur
                    </Link>
                  </div>
                ) : (
                  listings.map((l) => (
                    <div key={l.id} className="card p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              l.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : l.status === "Paused"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {l.status === "Active" ? "Aktif" : l.status === "Paused" ? "Duraklatıldı" : "Kapatıldı"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(l.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                              <span className="truncate">{l.homeLocation.addressText}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                              <span className="truncate">{l.workLocation.addressText}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {l.morningDepartTime.slice(0, 5)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {l.availableSeats} koltuk
                            </span>
                            <span className="font-semibold text-teal-600">₺{Math.round(l.pricePerTrip * 22)}/ay</span>
                          </div>
                        </div>

                        {/* Toggle aktif/pasif */}
                        {l.status !== "Closed" && (
                          <button
                            onClick={() => toggleListingStatus(l)}
                            className="shrink-0 flex flex-col items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors"
                          >
                            {l.status === "Active"
                              ? <ToggleRight className="w-7 h-7 text-teal-500" />
                              : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                            {l.status === "Active" ? "Duraklat" : "Aktifleştir"}
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-50">
                        <Link
                          href={`/ilan-olustur?edit=${l.id}`}
                          className="flex-1 text-center text-sm py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors font-medium flex items-center justify-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Düzenle
                        </Link>
                        <Link
                          href={`/ilan?id=${l.id}`}
                          className="flex-1 text-center text-sm py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors font-medium"
                        >
                          Gör
                        </Link>
                        <Link
                          href="/mesajlar"
                          className="flex-1 text-center text-sm py-2 bg-teal-50 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors font-medium"
                        >
                          İstekler
                        </Link>
                        <button
                          onClick={() => deleteListing(l.id)}
                          className="shrink-0 px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="İlanı sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Bildirimlerim (Kayıtlı Aramalar) ──────────── */}
            {tab === "searches" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-500" />
                  <h2 className="font-bold text-gray-900">Bildirim Aboneliklerim</h2>
                </div>
                <p className="text-sm text-gray-500 -mt-2">
                  Bu güzergahlara uygun yeni ilan eklendiğinde bildirim alırsın.
                </p>

                {searches.length === 0 ? (
                  <div className="card p-10 text-center">
                    <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="font-medium text-gray-500 mb-2">Henüz bildirim aboneliğin yok</p>
                    <p className="text-sm text-gray-400 mb-5">
                      Araç ararken sonuç çıkmazsa &quot;Bildirim Kur&quot; ile abone olabilirsin.
                    </p>
                    <Link href="/ilanlar" className="btn-primary inline-flex items-center gap-2">
                      <Car className="w-4 h-4" /> Araç Ara
                    </Link>
                  </div>
                ) : (
                  searches.map((s) => (
                    <div key={s.id} className="card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {s.city && (
                            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                              📍 {s.city}
                            </span>
                          )}
                          <div className="space-y-1.5 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                              <span className="truncate">{s.homeAddressText}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                              <span className="truncate">{s.workAddressText}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                              {s.radiusMeters >= 1000 ? `${s.radiusMeters / 1000}km` : `${s.radiusMeters}m`} yarıçap
                            </span>
                            {s.emailNotify && (
                              <span className="flex items-center gap-1 text-teal-600">
                                <Mail className="w-3 h-3" /> E-posta açık
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSearch(s.id)}
                          className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Aboneliği sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
