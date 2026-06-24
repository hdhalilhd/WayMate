"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { ConversationDto, MatchRequestDto } from "@/types";
import { MessageSquare, ArrowRight, Check, X, Inbox } from "lucide-react";

export default function MesajlarPage() {
  const router = useRouter();
  const user = getUser();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [requests, setRequests] = useState<MatchRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    return Promise.all([
      api.get<ConversationDto[]>("/conversations"),
      api.get<MatchRequestDto[]>("/matchrequests/received"),
    ]).then(([c, r]) => {
      setConversations(c.data);
      setRequests(r.data.filter((m) => m.status === "Pending"));
    });
  }

  useEffect(() => {
    if (!user) { router.push("/giris"); return; }
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function accept(id: string) {
    setBusyId(id);
    try {
      const { data } = await api.post<MatchRequestDto>(`/matchrequests/${id}/accept`);
      setRequests((prev) => prev.filter((m) => m.id !== id));
      if (data.conversationId) {
        router.push(`/mesaj?id=${data.conversationId}`);
      } else {
        await load();
      }
    } catch {
      alert("İstek kabul edilemedi. Lütfen tekrar deneyin.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    if (!confirm("Bu isteği reddetmek istediğine emin misin?")) return;
    setBusyId(id);
    try {
      await api.post(`/matchrequests/${id}/reject`);
      setRequests((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("İstek reddedilemedi.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const nothing = conversations.length === 0 && requests.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {requests.length > 0 && <span className="text-teal-600 font-medium">{requests.length} yeni istek · </span>}
              {conversations.length} aktif konuşma
            </p>
          </div>
          <Link href="/ilanlar" className="btn-outline py-2 px-4 text-sm">
            Araç Bul
          </Link>
        </div>

        {/* Gelen İstekler (henüz kabul edilmemiş) */}
        {requests.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Inbox className="w-4 h-4 text-teal-500" />
              <h2 className="font-bold text-gray-900">Gelen İstekler</h2>
            </div>
            <div className="space-y-3">
              {requests.map((m) => (
                <div key={m.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                      {m.riderName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{m.riderName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {m.initialMessage
                          ? <span className="italic">“{m.initialMessage}”</span>
                          : <span className="text-gray-400">Mesaj eklemedi — yolculuk isteği gönderdi.</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(m.requestedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => accept(m.id)}
                      disabled={busyId === m.id}
                      className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Kabul Et
                    </button>
                    <button
                      onClick={() => reject(m.id)}
                      disabled={busyId === m.id}
                      className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-500 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nothing ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-teal-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Henüz mesajınız yok</h3>
            <p className="text-sm text-gray-400 mb-6">
              Güzergahına uygun bir ilan bul ve istek gönder.
            </p>
            <Link href="/ilanlar" className="btn-primary inline-flex">
              İlan Ara →
            </Link>
          </div>
        ) : (
          conversations.length > 0 && (
            <div className="space-y-2">
              {requests.length > 0 && (
                <div className="flex items-center gap-2 mb-1 mt-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <h2 className="font-bold text-gray-900">Konuşmalar</h2>
                </div>
              )}
              {conversations.map((conv) => {
                const isDriver = user?.userId === conv.driverId;
                const other = isDriver
                  ? { name: conv.riderName, photo: conv.riderPhoto }
                  : { name: conv.driverName, photo: conv.driverPhoto };

                const isContactShared = conv.matchStatus === "ContactShared";

                return (
                  <div
                    key={conv.id}
                    onClick={() => router.push(`/mesaj?id=${conv.id}`)}
                    className="card p-4 cursor-pointer hover:border-teal-200 transition-all flex items-center gap-4 group"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                        {other.name[0]}
                      </div>
                      {isContactShared && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900 truncate">{other.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          isContactShared
                            ? "bg-green-100 text-green-700"
                            : "bg-teal-50 text-teal-700"
                        }`}>
                          {isContactShared ? "İletişim paylaşıldı" : "Mesajlaşma aktif"}
                        </span>
                      </div>
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {conv.lastMessage.senderId === user?.userId && (
                            <span className="font-medium">Sen: </span>
                          )}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-400 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
