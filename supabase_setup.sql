-- Supabase'de çalıştır: SQL Editor > New Query
-- PostGIS zaten aktif, sadece şemayı oluşturuyoruz

CREATE EXTENSION IF NOT EXISTS postgis;

-- EF Core migration tablosu
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" VARCHAR(150) NOT NULL,
    "ProductVersion" VARCHAR(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);
