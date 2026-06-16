-- WayMate — Power BI / analiz için hazır görünümler (views)
-- Supabase SQL Editor'da veya psql ile çalıştırılır. Power BI bunlara doğrudan bağlanır.

-- Günlük kayıt sayısı
CREATE OR REPLACE VIEW vw_daily_registrations AS
SELECT date_trunc('day', "CreatedAt")::date AS gun,
       COUNT(*) AS yeni_kullanici
FROM "Users"
GROUP BY 1 ORDER BY 1;

-- Günlük ilan sayısı
CREATE OR REPLACE VIEW vw_daily_listings AS
SELECT date_trunc('day', "CreatedAt")::date AS gun,
       COUNT(*) AS yeni_ilan
FROM "Listings"
GROUP BY 1 ORDER BY 1;

-- Günlük mesaj trafiği (kullanım yoğunluğu)
CREATE OR REPLACE VIEW vw_daily_messages AS
SELECT date_trunc('day', "SentAt")::date AS gun,
       COUNT(*) AS mesaj_sayisi,
       COUNT(DISTINCT "SenderId") AS aktif_kullanici
FROM "Messages"
GROUP BY 1 ORDER BY 1;

-- Şehir bazında ilan dağılımı
CREATE OR REPLACE VIEW vw_listings_by_city AS
SELECT COALESCE(NULLIF("City",''),'Belirtilmemiş') AS sehir,
       COUNT(*) AS ilan_sayisi,
       COUNT(*) FILTER (WHERE "Status" = 'Active') AS aktif_ilan
FROM "Listings"
GROUP BY 1 ORDER BY ilan_sayisi DESC;

-- Doğrulama istatistikleri
CREATE OR REPLACE VIEW vw_verification_stats AS
SELECT
  COUNT(*) AS toplam_kullanici,
  COUNT(*) FILTER (WHERE "IsEmailVerified") AS email_dogrulanmis,
  COUNT(*) FILTER (WHERE "IsTcVerified") AS tc_dogrulanmis,
  COUNT(*) FILTER (WHERE "AcceptedTermsAt" IS NOT NULL) AS sozlesme_kabul
FROM "Users";

-- Genel özet (tek satır — kart görselleri için)
CREATE OR REPLACE VIEW vw_summary AS
SELECT
  (SELECT COUNT(*) FROM "Users")                                   AS toplam_kullanici,
  (SELECT COUNT(*) FROM "Listings")                                AS toplam_ilan,
  (SELECT COUNT(*) FROM "Listings" WHERE "Status"='Active')        AS aktif_ilan,
  (SELECT COUNT(*) FROM "MatchRequests")                           AS toplam_eslesme_istegi,
  (SELECT COUNT(*) FROM "Messages")                                AS toplam_mesaj,
  (SELECT COUNT(*) FROM "Reports" WHERE "Status"='Open')           AS bekleyen_sikayet,
  (SELECT COUNT(*) FROM "Users" WHERE "CreatedAt" >= now() - interval '7 days') AS son_7_gun_kayit;

-- Şikayet özeti
CREATE OR REPLACE VIEW vw_reports_summary AS
SELECT "Status" AS durum, COUNT(*) AS adet,
       date_trunc('day', "CreatedAt")::date AS gun
FROM "Reports"
GROUP BY "Status", 3 ORDER BY 3 DESC;
