"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Car, Users, Shield, Leaf, MapPin, Search, ArrowRight, Check, Clock } from "lucide-react";

export default function HomePage() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
              Akıllı rota eşleştirmesiyle çalışan yeni platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Evden işe<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200">yalnız gitme.</span>
            </h1>
            <p className="mt-6 text-lg text-teal-50/90 max-w-md leading-relaxed">
              Aynı güzergahı kullanan komşularınla eşleş. Yakıt masrafını böl, trafiğin stresini azalt, yolculuğu keyifli hale getir.
            </p>

            {/* Arama kartı */}
            <div className="mt-8 glass rounded-3xl p-2.5 shadow-float max-w-lg">
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">●</span>
                  <input type="text" placeholder="Nereden? (ev adresin)" className="w-full bg-gray-50 rounded-2xl pl-9 pr-4 py-3.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400">●</span>
                  <input type="text" placeholder="Nereye? (iş adresin)" className="w-full bg-gray-50 rounded-2xl pl-9 pr-4 py-3.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
              <Link href="/ilanlar" className="mt-2 w-full gradient-brand text-white font-semibold py-4 rounded-2xl shadow-soft hover:shadow-float transition flex items-center justify-center gap-2">
                <Search className="w-5 h-5" /> Yol Arkadaşı Bul
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-teal-50/80">
              <span className="flex items-center gap-2">🔒 Onaylı profiller</span>
              <span className="flex items-center gap-2">💬 Güvenli mesajlaşma</span>
              <span className="flex items-center gap-2">🗺️ Rota bazlı eşleştirme</span>
            </div>
          </div>

          {/* Sağ görsel — gradient illüstrasyon + yüzen kartlar */}
          <div className="relative reveal hidden lg:block">
            <div className="relative rounded-[2rem] overflow-hidden shadow-float float-anim h-[460px] bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-400">
              <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 400 460" fill="none" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="400" height="460" fill="url(#grid)" />
                <path d="M70 400 C 70 300, 330 280, 330 180 S 120 80, 200 40" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 16" />
                <circle cx="70" cy="400" r="14" fill="#22c55e" stroke="#fff" strokeWidth="4" />
                <circle cx="200" cy="40" r="14" fill="#ef4444" stroke="#fff" strokeWidth="4" />
              </svg>
              <div className="absolute top-1/2 right-12 -translate-y-1/2 w-14 h-14 bg-white rounded-full grid place-items-center shadow-lg">
                <Car className="w-7 h-7 text-brand-600" />
              </div>
              <div className="absolute bottom-5 left-5 text-white">
                <p className="text-2xl font-extrabold drop-shadow">Kadıköy → Levent</p>
                <p className="text-teal-50/90 text-sm">Her sabah aynı yol, artık birlikte</p>
              </div>
            </div>

            <div className="absolute -left-8 top-12 bg-white rounded-2xl shadow-float p-4 w-56 float-anim-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold">M</div>
                <div>
                  <p className="font-bold text-ink text-sm">Mehmet Y.</p>
                  <p className="text-xs text-gray-400">Onaylı üye · Kadıköy</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" /> Kadıköy
                <span className="flex-1 border-t border-dashed border-gray-300" />
                <span className="w-2 h-2 bg-red-400 rounded-full" /> Levent
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">Sabah 07:30</span>
                <span className="font-extrabold text-brand-600">₺1.100<span className="text-xs font-medium text-gray-400">/ay</span></span>
              </div>
            </div>

            <div className="absolute -right-6 bottom-10 bg-white rounded-2xl shadow-float p-4 w-48 float-anim">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-1">
                <Check className="w-5 h-5" /> Eşleşme bulundu!
              </div>
              <p className="text-xs text-gray-500">Güzergahın yüksek oranda uyumlu</p>
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
          {[
            { icon: "🗺️", t: "Rota bazlı eşleştirme", d: "Sadece yol üstündeki ilanları gösterir" },
            { icon: "🔒", t: "Güvenli iletişim", d: "Onaylı profiller, kapalı mesajlaşma" },
            { icon: "💸", t: "Ücretsiz kullanım", d: "Kayıt ve eşleşme tamamen bedava" },
            { icon: "📍", t: "Tüm Türkiye", d: "81 ilde adres bazlı arama" },
          ].map((f) => (
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
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">Basit & Hızlı</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">Üç adımda yola çık</h2>
            <p className="text-gray-500 mt-4 text-lg">Dakikalar içinde güzergahına uygun yol arkadaşını bul.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { n: "01", icon: <MapPin className="w-8 h-8 text-white" />, t: "Güzergahını gir", d: "Ev ve iş adresini gir. Harita üzerinde rotanı saniyeler içinde oluşturalım." },
              { n: "02", icon: <Users className="w-8 h-8 text-white" />, t: "Eşleş & mesajlaş", d: "Rotana ve saatine uyan sürücülerle eşleş, güvenli sohbet üzerinden anlaş." },
              { n: "03", icon: <Car className="w-8 h-8 text-white" />, t: "Birlikte git, tasarruf et", d: "Masrafı paylaş, her ay yüzlerce lira cepte kalsın. Hem de çevreye katkı." },
            ].map((s, i) => (
              <div key={s.n} className="reveal card-hover bg-white rounded-3xl p-8 shadow-card border border-gray-50" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 rounded-2xl gradient-brand grid place-items-center shadow-soft mb-6">{s.icon}</div>
                <span className="text-5xl font-extrabold text-brand-100">{s.n}</span>
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
              <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">Örnek ilanlar</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">İlanlar böyle görünür</h2>
              <p className="text-gray-500 mt-2 text-sm">Aşağıdaki kartlar, bir ilanın sistemde nasıl listelendiğini gösterir.</p>
            </div>
            <Link href="/ilanlar" className="text-brand-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">Tümünü gör <ArrowRight className="w-5 h-5" /></Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { g: "from-brand-400 to-cyan-400", city: "İstanbul", seat: "3 koltuk", n: "Mehmet Y.", a: "Kadıköy, Moda", b: "Levent, Metrocity", t: "07:30 · 18:00", p: "1.100" },
              { g: "from-cyan-400 to-brand-500", city: "İstanbul", seat: "1 koltuk", n: "Ayşe K.", a: "Üsküdar, Kısıklı", b: "Maslak, 42 Plaza", t: "08:00 · 17:30", p: "1.300" },
              { g: "from-teal-500 to-emerald-400", city: "Ankara", seat: "2 koltuk", n: "Burak T.", a: "Çankaya", b: "Söğütözü", t: "07:45 · 18:15", p: "950" },
            ].map((c, i) => (
              <div key={c.n} className="reveal card-hover bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${c.g}`}>
                  <Car className="absolute -right-3 -bottom-2 w-28 h-28 text-white/20" strokeWidth={1.5} />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-brand-700">{c.city}</span>
                  <span className="absolute top-3 right-3 bg-white text-emerald-600 text-xs font-bold px-3 py-1 rounded-full shadow">{c.seat}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 -mt-10 relative">
                    <div className="w-14 h-14 rounded-2xl border-4 border-white bg-brand-100 grid place-items-center text-brand-700 font-bold text-lg shadow">{c.n[0]}</div>
                    <div className="pt-7"><p className="font-bold">{c.n}</p><p className="text-xs text-gray-400">Onaylı üye</p></div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 bg-emerald-400 rounded-full" /> {c.a}</p>
                    <p className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 bg-red-400 rounded-full" /> {c.b}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {c.t}</div>
                    <div className="text-right"><span className="text-xl font-extrabold text-brand-600">₺{c.p}</span><span className="text-xs text-gray-400">/ay</span></div>
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
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">Kimler için?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">İki tarafı da buluşturur</h2>
            <p className="text-gray-500 mt-4 text-lg">İster aracın olsun, ister araç arıyor ol — WayMate ikisini de aynı güzergahta eşleştirir.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-14">
            <div className="reveal rounded-3xl p-8 bg-white border border-brand-100/60 shadow-card">
              <div className="w-14 h-14 rounded-2xl gradient-brand grid place-items-center shadow-soft text-2xl">🚗</div>
              <h3 className="text-xl font-bold mt-5">Aracı olan</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">Her gün tek başına gidiyorsun, koltukların boş. İlan ver; ev–iş güzergahını, saatlerini ve aylık ücreti belirle.</p>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
                {["Rotanı haritada otomatik çiz", "Yol üstü sapma mesafesini ayarla", "Esneklik durumunu belirt", "Masrafı paylaş, koltukları değerlendir"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 shrink-0" /> {x}</li>
                ))}
              </ul>
              <Link href="/ilan-olustur" className="btn-primary inline-flex mt-6">İlan Ver</Link>
            </div>
            <div className="reveal rounded-3xl p-8 bg-white border border-brand-100/60 shadow-card" style={{ transitionDelay: "0.1s" }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-brand-500 grid place-items-center shadow-soft text-2xl">🧍</div>
              <h3 className="text-xl font-bold mt-5">Araç arayan</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">Toplu taşımayla uğraşmak istemiyorsun. Ev ve iş adresini gir; güzergahına uygun sürücüleri anında listele.</p>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-600">
                {["Sadece rotana uyan ilanları gör", "Kalkış saatine göre filtrele", "Sürücüyle güvenli mesajlaş", "İlan yoksa bildirim kur, çıkınca haber al"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 shrink-0" /> {x}</li>
                ))}
              </ul>
              <Link href="/ilanlar" className="btn-primary inline-flex mt-6">Araç Bul</Link>
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
              <p className="text-2xl font-extrabold">Birlikte daha keyifli</p>
              <p className="text-teal-50/90 mt-2 max-w-xs mx-auto">Aynı yolu paylaş, masrafı böl, çevreyi koru.</p>
            </div>
          </div>
          <div className="reveal">
            <span className="text-emerald-200 font-bold text-sm uppercase tracking-wider">Neden WayMate?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight leading-tight">Daha az masraf,<br />daha çok keyif.</h2>
            <div className="mt-8 space-y-5">
              {[
                { i: <Car className="w-5 h-5" />, t: "Yakıt masrafını böl", d: "Günlük gidip-gelme masrafını paylaş, ayda yüzlerce lira tasarruf et." },
                { i: <Leaf className="w-5 h-5" />, t: "Trafiği & emisyonu azalt", d: "Daha az araç = daha az trafik, daha temiz hava." },
                { i: <Shield className="w-5 h-5" />, t: "Güvenli & onaylı", d: "Kimlik doğrulamalı profiller, kapalı mesajlaşma, şikayet sistemi." },
                { i: <Users className="w-5 h-5" />, t: "Yeni insanlar tanı", d: "Aynı semtten, aynı işyerinden komşularınla tanış." },
              ].map((b) => (
                <div key={b.t} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 grid place-items-center shrink-0">{b.i}</div>
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
            <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">Merak edilenler</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">Sıkça sorulan sorular</h2>
          </div>
          <div className="mt-12 space-y-4">
            {[
              { q: "WayMate ücretli mi?", a: "Hayır, kayıt ve kullanım tamamen ücretsizdir. Sadece yol arkadaşınla anlaştığın yolculuk ücretini paylaşırsın." },
              { q: "Eşleştirme nasıl çalışıyor?", a: "Ev ve iş adresini girdiğinde sistem rotanı hesaplar ve güzergahı seninkiyle örtüşen sürücüleri otomatik listeler. Sadece yol üstündeki ilanlar gösterilir." },
              { q: "Güvenli mi?", a: "Profiller e-posta ve TC kimlik ile doğrulanabilir. İletişim bilgilerin, sen onaylamadan paylaşılmaz. Şüpheli durumlar Şikayet Et özelliğiyle bildirilebilir." },
              { q: "Aracım yok, yine de kullanabilir miyim?", a: "Elbette! Araç arayan olarak kayıt ol, güzergahına uygun sürücüleri bul ve onlarla iletişime geç." },
            ].map((f, i) => (
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
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight relative">Bugün yola çıkmaya hazır mısın?</h2>
          <p className="mt-4 text-teal-50/90 text-lg max-w-xl mx-auto relative">Ücretsiz kayıt ol, saniyeler içinde yol arkadaşını bul ya da ilanını ver.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative">
            <Link href="/ilanlar" className="bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:-translate-y-0.5 transition">🚗 Araç Bul</Link>
            <Link href="/ilan-olustur" className="bg-ink/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-ink/30 transition">+ İlan Ver</Link>
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
            <p className="text-sm leading-relaxed max-w-xs">Her gün aynı yolu kullananları buluşturan akıllı araç paylaşım platformu.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/ilanlar" className="hover:text-brand-400 transition">Araç Bul</Link></li>
              <li><Link href="/ilan-olustur" className="hover:text-brand-400 transition">İlan Ver</Link></li>
              <li><a href="#nasil" className="hover:text-brand-400 transition">Nasıl Çalışır</a></li>
              <li><Link href="/kayit" className="hover:text-brand-400 transition">Üye Ol</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Yasal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sozlesme" className="hover:text-brand-400 transition">Kullanıcı Sözleşmesi</Link></li>
              <li><Link href="/sozlesme" className="hover:text-brand-400 transition">Gizlilik</Link></li>
              <li><Link href="/sozlesme" className="hover:text-brand-400 transition">KVKK</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© 2026 WayMate. Tüm hakları saklıdır.</p>
          <p>waymate.com.tr · ❤️ ile Türkiye&apos;de yapıldı</p>
        </div>
      </footer>
    </div>
  );
}
