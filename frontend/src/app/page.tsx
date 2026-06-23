"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Car, Users, Shield, Leaf, MapPin, Search, ArrowRight, Check, Clock, Navigation } from "lucide-react";
import CitySelect from "@/components/CitySelect";
import { DISTRICTS } from "@/lib/districts";
import { useLangCtx } from "@/components/Providers";
import { home } from "@/lib/i18n";

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLangCtx();
  const h = home[lang];

  const [heroCity, setHeroCity] = useState("");
  const [heroDistrict, setHeroDistrict] = useState("");
  const heroDistricts = heroCity ? (DISTRICTS[heroCity] ?? []) : [];

  function goSearch() {
    const params = new URLSearchParams();
    if (heroCity) params.set("city", heroCity);
    if (heroDistrict) params.set("district", heroDistrict);
    if (!heroCity && !heroDistrict) params.set("all", "1");
    router.push(`/ilanlar?${params.toString()}`);
  }

  useEffect(() => {
    // Render uyku sorununa karşı sayfa açılınca API'yi uyandır (fire-and-forget)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) fetch(`${apiUrl}/health`).catch(() => {});

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Örnek ilan kartları (şehir/adres/isim sabit veri; etiketler çeviriye tabi)
  const examples = [
    { g: "from-brand-400 to-cyan-400", city: "İstanbul", seatN: 3, n: "Mehmet Y.", a: "Kadıköy, Moda", b: "Levent, Metrocity", t: "07:30 · 18:00", p: "1.100" },
    { g: "from-cyan-400 to-brand-500", city: "İstanbul", seatN: 1, n: "Ayşe K.", a: "Üsküdar, Kısıklı", b: "Maslak, 42 Plaza", t: "08:00 · 17:30", p: "1.300" },
    { g: "from-teal-500 to-emerald-400", city: "Ankara", seatN: 2, n: "Burak T.", a: "Çankaya", b: "Söğütözü", t: "07:45 · 18:15", p: "950" },
  ];

  const stepIcons = [<MapPin key="0" className="w-8 h-8 text-white" />, <Users key="1" className="w-8 h-8 text-white" />, <Car key="2" className="w-8 h-8 text-white" />];
  const benefitIcons = [<Car key="0" className="w-5 h-5" />, <Leaf key="1" className="w-5 h-5" />, <Shield key="2" className="w-5 h-5" />, <Users key="3" className="w-5 h-5" />];

  return (
    <div className="font-sans overflow-x-hidden">
      {/* HERO */}
      <header className="relative gradient-mesh text-white overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-300/30 rounded-full blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blob" />

        <div className="relative max-w-7xl mx-auto px-5 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              {h.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {h.title1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200">{h.title2}</span>
            </h1>
            <p className="mt-6 text-lg text-teal-50/90 max-w-md leading-relaxed">
              {h.desc}
            </p>

            {/* Arama kartı — il/ilçe seçici */}
            <div className="mt-8 glass rounded-3xl p-3 shadow-float max-w-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <CitySelect
                    value={heroCity}
                    onChange={(v) => { setHeroCity(v); setHeroDistrict(""); }}
                    placeholder={h.cityPlaceholder}
                  />
                </div>
                {heroDistricts.length > 0 && (
                  <div className="flex-1">
                    <select
                      value={heroDistrict}
                      onChange={(e) => setHeroDistrict(e.target.value)}
                      className="input"
                    >
                      <option value="">{h.allDistricts}</option>
                      {heroDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={goSearch}
                className="mt-2 w-full gradient-brand text-white font-semibold py-4 rounded-2xl shadow-soft hover:shadow-float transition flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" /> {h.searchBtn}
              </button>
              <button
                type="button"
                onClick={() => router.push("/ilanlar?mode=nearby")}
                className="mt-2 w-full text-sm text-gray-500 hover:text-teal-600 transition inline-flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" /> {h.nearbyBtn}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-teal-50/80">
              {h.trust.map((tr) => (
                <span key={tr} className="flex items-center gap-2">{tr}</span>
              ))}
            </div>
          </div>

          {/* Sağ görsel — gerçek fotoğraf + yüzen kartlar */}
          <div className="relative reveal hidden lg:block">
            <div className="relative rounded-[2rem] overflow-hidden shadow-float float-anim h-[460px]">
              <Image
                src="/hero.jpg"
                alt={lang === "tr" ? "Birlikte yola çıkan yol arkadaşları" : "Ride buddies hitting the road together"}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              {/* Okunabilirlik + marka tonu için degradeler */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/30 via-transparent to-cyan-400/10" />

              {/* Rota rozeti */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {h.routeFrom}
                <span className="w-6 border-t border-dashed border-gray-300" />
                <span className="w-2 h-2 rounded-full bg-red-500" /> {h.routeTo}
              </div>

              <div className="absolute bottom-5 left-5 text-white">
                <p className="text-2xl font-extrabold drop-shadow-lg">{h.routeTitle}</p>
                <p className="text-white/90 text-sm drop-shadow">{h.routeSub}</p>
              </div>
            </div>

            <div className="absolute -left-8 top-12 bg-white rounded-2xl shadow-float p-4 w-56 float-anim-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold">M</div>
                <div>
                  <p className="font-bold text-ink text-sm">Mehmet Y.</p>
                  <p className="text-xs text-gray-400">{h.floatMember}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" /> {h.routeFrom}
                <span className="flex-1 border-t border-dashed border-gray-300" />
                <span className="w-2 h-2 bg-red-400 rounded-full" /> {h.routeTo}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{h.floatMorning}</span>
                <span className="font-extrabold text-brand-600">₺1.100<span className="text-xs font-medium text-gray-400">{h.perMonth}</span></span>
              </div>
            </div>

            <div className="absolute -right-6 bottom-10 bg-white rounded-2xl shadow-float p-4 w-48 float-anim">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-1">
                <Check className="w-5 h-5" /> {h.matchFound}
              </div>
              <p className="text-xs text-gray-500">{h.matchDesc}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[88%] gradient-brand rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 1440 80" className="w-full block" preserveAspectRatio="none"><path fill="#ffffff" d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" /></svg>
        </div>
      </header>

      {/* SİSTEM ÖZELLİK ŞERİDİ */}
      <section className="py-12 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {h.strip.map((f) => (
            <div key={f.t} className="reveal flex items-start gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div><p className="font-bold text-ink">{f.t}</p><p className="text-sm text-gray-500 mt-0.5">{f.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" className="py-24 bg-gradient-to-b from-white to-brand-50/40">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto reveal">
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">{h.howEyebrow}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">{h.howTitle}</h2>
            <p className="text-gray-500 mt-4 text-lg">{h.howSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {h.steps.map((s, i) => (
              <div key={s.t} className="reveal card-hover bg-white rounded-3xl p-8 shadow-card border border-gray-50" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 rounded-2xl gradient-brand grid place-items-center shadow-soft mb-6">{stepIcons[i]}</div>
                <span className="text-5xl font-extrabold text-brand-100">{`0${i + 1}`}</span>
                <h3 className="text-xl font-bold mt-2">{s.t}</h3>
                <p className="text-gray-500 mt-2 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÖRNEK İLANLAR */}
      <section id="ilanlar" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 reveal">
            <div>
              <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">{h.listingsEyebrow}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">{h.listingsTitle}</h2>
              <p className="text-gray-500 mt-2 text-sm">{h.listingsSub}</p>
            </div>
            <Link href="/ilanlar" className="text-brand-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">{h.seeAll} <ArrowRight className="w-5 h-5" /></Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {examples.map((c, i) => (
              <div key={c.n} className="reveal card-hover bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${c.g}`}>
                  <Car className="absolute -right-3 -bottom-2 w-28 h-28 text-white/20" strokeWidth={1.5} />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-brand-700">{c.city}</span>
                  <span className="absolute top-3 right-3 bg-white text-emerald-600 text-xs font-bold px-3 py-1 rounded-full shadow">{c.seatN} {h.seatWord}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 -mt-10 relative">
                    <div className="w-14 h-14 rounded-2xl border-4 border-white bg-brand-100 grid place-items-center text-brand-700 font-bold text-lg shadow">{c.n[0]}</div>
                    <div className="pt-7"><p className="font-bold">{c.n}</p><p className="text-xs text-gray-400">{h.verifiedMember}</p></div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 bg-emerald-400 rounded-full" /> {c.a}</p>
                    <p className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 bg-red-400 rounded-full" /> {c.b}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {c.t}</div>
                    <div className="text-right"><span className="text-xl font-extrabold text-brand-600">₺{c.p}</span><span className="text-xs text-gray-400">{h.perMonth}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KİMLER İÇİN */}
      <section className="py-24 bg-gradient-to-b from-brand-50/40 to-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto reveal">
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">{h.whoEyebrow}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">{h.whoTitle}</h2>
            <p className="text-gray-500 mt-4 text-lg">{h.whoSub}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-14">
            <div className="reveal rounded-3xl p-8 bg-white border border-brand-100/60 shadow-card">
              <div className="w-14 h-14 rounded-2xl gradient-brand grid place-items-center shadow-soft text-2xl">🚗</div>
              <h3 className="text-xl font-bold mt-5">{h.driverTitle}</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">{h.driverDesc}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
                {h.driverBullets.map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 shrink-0" /> {x}</li>
                ))}
              </ul>
              <Link href="/ilan-olustur" className="btn-primary inline-flex mt-6">{h.driverBtn}</Link>
            </div>
            <div className="reveal rounded-3xl p-8 bg-white border border-brand-100/60 shadow-card" style={{ transitionDelay: "0.1s" }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-brand-500 grid place-items-center shadow-soft text-2xl">🧍</div>
              <h3 className="text-xl font-bold mt-5">{h.riderTitle}</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">{h.riderDesc}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
                {h.riderBullets.map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 shrink-0" /> {x}</li>
                ))}
              </ul>
              <Link href="/ilanlar" className="btn-primary inline-flex mt-6">{h.riderBtn}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEDEN WAYMATE */}
      <section id="neden" className="py-24 gradient-mesh text-white relative overflow-hidden">
        <div className="absolute -top-20 right-1/3 w-72 h-72 bg-cyan-300/20 rounded-full blob" />
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center relative">
          <div className="reveal rounded-[2rem] shadow-float w-full h-[420px] bg-gradient-to-br from-brand-600 to-cyan-500 relative overflow-hidden grid place-items-center">
            <div className="relative text-center text-white px-8">
              <div className="text-6xl mb-4">🚗💨</div>
              <p className="text-2xl font-extrabold">{h.whyImgTitle}</p>
              <p className="text-teal-50/90 mt-2 max-w-xs mx-auto">{h.whyImgSub}</p>
            </div>
          </div>
          <div className="reveal">
            <span className="text-emerald-200 font-bold text-sm uppercase tracking-wider">{h.whyEyebrow}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight leading-tight">{h.whyTitle1}<br />{h.whyTitle2}</h2>
            <div className="mt-8 space-y-5">
              {h.benefits.map((b, i) => (
                <div key={b.t} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 grid place-items-center shrink-0">{benefitIcons[i]}</div>
                  <div><p className="font-bold text-lg">{b.t}</p><p className="text-teal-50/80 text-sm mt-1">{b.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section id="sss" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center reveal">
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">{h.faqEyebrow}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">{h.faqTitle}</h2>
          </div>
          <div className="mt-12 space-y-4">
            {h.faq.map((f, i) => (
              <details key={f.q} className="faq-item reveal bg-white rounded-2xl border border-gray-100 shadow-card p-5 group" open={i === 0}>
                <summary className="flex items-center justify-between cursor-pointer font-semibold list-none">{f.q}<span className="faq-icon text-brand-500 text-2xl font-light">+</span></summary>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto gradient-brand rounded-[2.5rem] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-float reveal">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blob" />
          <div className="absolute -bottom-12 -left-8 w-56 h-56 bg-cyan-300/20 rounded-full blob" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight relative">{h.ctaTitle}</h2>
          <p className="mt-4 text-teal-50/90 text-lg max-w-xl mx-auto relative">{h.ctaSub}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative">
            <Link href="/ilanlar" className="bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:-translate-y-0.5 transition">{h.ctaFind}</Link>
            <Link href="/ilan-olustur" className="bg-ink/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-ink/30 transition">{h.ctaPost}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 gradient-brand rounded-xl grid place-items-center"><Car className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-extrabold text-white">Way<span className="text-brand-400">Mate</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">{h.footerDesc}</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">{h.footerPlatform}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/ilanlar" className="hover:text-brand-400 transition">{h.fNav[0]}</Link></li>
              <li><Link href="/ilan-olustur" className="hover:text-brand-400 transition">{h.fNav[1]}</Link></li>
              <li><a href="#nasil" className="hover:text-brand-400 transition">{h.fNav[2]}</a></li>
              <li><Link href="/kayit" className="hover:text-brand-400 transition">{h.fNav[3]}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">{h.footerLegal}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sozlesme" className="hover:text-brand-400 transition">{h.fLegal[0]}</Link></li>
              <li><Link href="/sozlesme" className="hover:text-brand-400 transition">{h.fLegal[1]}</Link></li>
              <li><Link href="/sozlesme" className="hover:text-brand-400 transition">{h.fLegal[2]}</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>{h.copyright}</p>
          <p>{h.madeIn}</p>
        </div>
      </footer>
    </div>
  );
}
