"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hata ayıklama için konsola yaz (tarayıcı konsolunda görünür)
    console.error("WayMate global error:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🚗</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Bir şeyler ters gitti</h1>
            <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.5, margin: "0 0 22px" }}>
              Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar dene; sorun sürerse sayfayı yenile.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{ background: "linear-gradient(135deg,#0d9488,#22d3ee)", color: "#fff", border: "none", padding: "12px 22px", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15 }}
              >
                Tekrar dene
              </button>
              <a
                href="/"
                style={{ background: "#fff", color: "#0f766e", border: "1px solid #99f6e4", padding: "12px 22px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 15 }}
              >
                Ana sayfaya dön
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
