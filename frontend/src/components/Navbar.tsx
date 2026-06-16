"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "@/lib/auth";
import { Car, MessageSquare, Menu, X, Plus, Globe } from "lucide-react";
import { useState } from "react";
import { useLangCtx } from "@/components/Providers";
import { t } from "@/lib/i18n";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const { lang, setLang } = useLangCtx();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() { clearUser(); router.push("/"); }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-teal-500 rounded-xl p-1.5">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 hidden sm:block">
Way<span className="text-teal-500">Mate</span>
          </span>
        </Link>

        {/* Desktop sağ taraf */}
        <div className="hidden md:flex items-center gap-2">

          {/* Dil seçici */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setLang("tr")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                lang === "tr" ? "bg-teal-500 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              🇹🇷 TR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                lang === "en" ? "bg-teal-500 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          {user ? (
            <>
              {/* İlan ver */}
              <Link href="/ilan-olustur"
                className="flex items-center gap-1.5 btn-primary py-2 px-4 text-sm">
                <Plus className="w-4 h-4" />
                {t(lang, "postRide")}
              </Link>

              {/* Bildirim zili */}
              <NotificationBell />

              {/* Mesajlar ikonu — büyük */}
              <Link href="/mesajlar"
                className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                title={t(lang, "messages")}>
                <MessageSquare className="w-6 h-6" />
              </Link>

              {/* Profil avatarı — büyük */}
              <Link href="/profil"
                className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-base hover:bg-teal-200 transition-colors"
                title={t(lang, "profile")}>
                {user.fullName[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link href="/giris" className="text-sm font-medium text-gray-600 hover:text-teal-600 px-2">
                {t(lang, "login")}
              </Link>
              <Link href="/kayit" className="btn-primary py-2 px-4 text-sm">
                {t(lang, "register")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile sağ */}
        <div className="md:hidden flex items-center gap-2">
          {/* Dil toggle mobile */}
          <button
            onClick={() => setLang(lang === "tr" ? "en" : "tr")}
            className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-600"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang.toUpperCase()}
          </button>
          <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menü */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          <Link href="/ilanlar" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700">
            {t(lang, "findRide")}
          </Link>
          {user ? (
            <>
              <Link href="/ilan-olustur" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-600 hover:bg-teal-50">
                <Plus className="w-4 h-4" /> {t(lang, "postRide")}
              </Link>
              <Link href="/mesajlar" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                <MessageSquare className="w-4 h-4" /> {t(lang, "messages")}
              </Link>
              <Link href="/profil" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                {t(lang, "profile")}
              </Link>
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">
                {t(lang, "logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-teal-50">
                {t(lang, "login")}
              </Link>
              <Link href="/kayit" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-600 hover:bg-teal-50">
                {t(lang, "register")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
