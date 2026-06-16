# WayMate — Yayına Alma Rehberi (waymate.com.tr)

Mimari:
```
waymate.com.tr (+www)  →  Vercel        (Next.js frontend)
api.waymate.com.tr     →  Render        (.NET backend)
                              ↓
                          Supabase       (PostgreSQL + PostGIS)
```

Hepsi ücretsiz başlangıç planıyla başlar. Sırayla:

---

## 1) Veritabanı — Supabase

1. https://supabase.com → "New Project"
   - Name: `waymate`
   - Database Password: güçlü bir şifre belirle → **NOT AL**
   - Region: `Central EU (Frankfurt)`
2. Proje açılınca: sol menü → **SQL Editor** → New Query
3. `supabase_schema.sql` dosyasının tamamını yapıştır → **Run** (tablolar + PostGIS kurulur)
4. (Opsiyonel veri) `supabase_data.sql` içeriğini de yapıştırıp çalıştır
5. **Connection string** al: üstte "Connect" → "Session pooler" sekmesi → string'i kopyala.
   .NET formatına çevrilmiş hali (Render'a bunu gireceğiz):
   ```
   Host=aws-0-eu-central-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.xxxx;Password=ŞİFREN;SSL Mode=Require;Trust Server Certificate=true
   ```

---

## 2) Backend — Render

1. Kodu GitHub'a yükle (aşağıda "GitHub" bölümü)
2. https://render.com → GitHub ile giriş → **New → Blueprint** → repoyu seç
   (repo kökündeki `render.yaml` otomatik okunur)
3. Açılan ortam değişkenlerini doldur:

   | Değişken | Değer |
   |---|---|
   | `ConnectionStrings__DefaultConnection` | Supabase bağlantı string'i |
   | `Jwt__Key` | (güçlü secret — geliştirici tarafından ayrıca iletilir) |
   | `Google__ClientId` | Google OAuth Client ID |
   | `GoogleMaps__ApiKey` | Google Maps API key |
   | `Smtp__Username` / `Smtp__FromEmail` | Gmail adresi |
   | `Smtp__Password` | Gmail App Password |

   > ⚠️ Gerçek secret değerleri güvenlik gereği repoda tutulmaz; yalnızca Render panelinde girilir.

4. Deploy bitince Render bir URL verir: `https://waymate-api.onrender.com`
5. **Custom domain**: Render → Settings → Custom Domain → `api.waymate.com.tr` ekle

---

## 3) Frontend — Vercel

1. https://vercel.com → GitHub ile giriş → **Add New → Project** → repoyu seç
2. **Root Directory**: `frontend` seç
3. Environment Variables:
   | Değişken | Değer |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://api.waymate.com.tr` |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
4. Deploy → Vercel bir URL verir
5. **Domain**: Vercel → Settings → Domains → `waymate.com.tr` ve `www.waymate.com.tr` ekle

---

## 4) DNS (waymate.com.tr panelinde)

Domain sağlayıcının DNS ayarlarına:

| Tip | Ad | Değer |
|---|---|---|
| A | `@` | Vercel'in verdiği IP (`76.76.21.21`) |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `api` | `waymate-api.onrender.com` |

(Vercel ve Render panelinde domain eklerken sana tam değerleri gösterir.)

---

## 5) Google Cloud (OAuth + Maps)

console.cloud.google.com → APIs & Services → Credentials → OAuth client (434630...):
- **Authorized JavaScript origins** ekle: `https://www.waymate.com.tr`, `https://waymate.com.tr`
- Maps API key kısıtlaması varsa, referrer'a `*.waymate.com.tr/*` ekle

---

## GitHub'a Yükleme

```powershell
cd C:\Users\HALIL\yolarkadashim
git remote add origin https://github.com/KULLANICI_ADIN/waymate.git
git push -u origin main
```

(Repo zaten commit edildi, sadece push gerekiyor.)
