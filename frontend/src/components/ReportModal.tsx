"use client";

import { useState } from "react";
import { X, Flag, CheckCircle } from "lucide-react";
import api from "@/lib/api";

interface Props {
  reportedUserId?: string;
  listingId?: string;
  targetName?: string;
  onClose: () => void;
}

const REASONS = [
  { key: "sahte-ilan", label: "Sahte veya yanıltıcı ilan" },
  { key: "taciz", label: "Taciz / uygunsuz davranış" },
  { key: "spam", label: "Spam veya reklam" },
  { key: "dolandiricilik", label: "Dolandırıcılık şüphesi" },
  { key: "guvenlik", label: "Güvenlik endişesi" },
  { key: "diger", label: "Diğer" },
];

export default function ReportModal({ reportedUserId, listingId, targetName, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function toggle(key: string) {
    setSelected((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  async function submit() {
    if (selected.length === 0) { setError("En az bir sebep seçmelisin."); return; }
    setLoading(true); setError("");
    try {
      await api.post("/reports", {
        reportedUserId: reportedUserId ?? null,
        listingId: listingId ?? null,
        reasons: selected,
        description: description || null,
      });
      setDone(true);
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(m || "Şikayet gönderilemedi.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Şikayetin alındı</h3>
            <p className="text-sm text-gray-500 mb-5">En kısa sürede incelenecektir. Teşekkürler.</p>
            <button onClick={onClose} className="btn-primary w-full">Kapat</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-900">Şikayet Et</h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4">
              {targetName && (
                <p className="text-sm text-gray-500">Şikayet edilen: <span className="font-medium text-gray-700">{targetName}</span></p>
              )}
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Şikayet sebebi (birden fazla seçebilirsin)</p>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label key={r.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selected.includes(r.key) ? "border-red-300 bg-red-50" : "border-gray-100 hover:border-gray-200"
                    }`}>
                      <input type="checkbox" checked={selected.includes(r.key)} onChange={() => toggle(r.key)}
                        className="w-4 h-4 accent-red-500" />
                      <span className="text-sm text-gray-700">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Açıklama <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={3} maxLength={1000} placeholder="Detay ekleyebilirsin..." className="input resize-none text-sm" />
              </div>

              <div className="flex gap-2">
                <button onClick={onClose} className="btn-outline flex-1">Vazgeç</button>
                <button onClick={submit} disabled={loading || selected.length === 0}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
                  {loading ? "Gönderiliyor..." : "Şikayet Et"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
