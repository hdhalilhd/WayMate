"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { ConversationDto } from "@/types";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function MesajlarPage() {
  const router = useRouter();
  const user = getUser();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/giris"); return; }
    api.get<ConversationDto[]>("/conversations")
      .then((r) => setConversations(r.data))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
            <p className="text-sm text-gray-500 mt-0.5">{conversations.length} aktif konuşma</p>
          </div>
          <Link href="/ilanlar" className="btn-outline py-2 px-4 text-sm">
            Araç Bul
          </Link>
        </div>

        {conversations.length === 0 ? (
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
          <div className="space-y-2">
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
                  {/* Avatar */}
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
        )}
      </div>
    </div>
  );
}
