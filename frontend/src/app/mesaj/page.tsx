"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { startConnection } from "@/lib/signalr";
import type { MessageDto, ConversationDto, ContactDto } from "@/types";
import { Send, Phone, Mail, ArrowLeft, Share2, Lock, Flag } from "lucide-react";
import VerifiedBadges from "@/components/VerifiedBadges";
import ReportModal from "@/components/ReportModal";

function KonusmaInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const user = getUser();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [conv, setConv] = useState<ConversationDto | null>(null);
  const [contact, setContact] = useState<ContactDto | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sharingContact, setSharingContact] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isDriver = user?.userId === conv?.driverId;
  const otherName = conv
    ? user?.userId === conv.driverId ? conv.riderName : conv.driverName
    : "";
  const otherId = conv ? (isDriver ? conv.riderId : conv.driverId) : undefined;
  const otherEmailVerified = conv ? (isDriver ? conv.riderEmailVerified : conv.driverEmailVerified) : false;
  const otherTcVerified = conv ? (isDriver ? conv.riderTcVerified : conv.driverTcVerified) : false;

  useEffect(() => {
    if (!user) { router.push("/giris"); return; }

    Promise.all([
      api.get<ConversationDto[]>("/conversations"),
      api.get<MessageDto[]>(`/conversations/${id}/messages`),
    ]).then(([convRes, msgRes]) => {
      const found = convRes.data.find((c) => c.id === id);
      if (found) {
        setConv(found);
        fetchContact(found.matchRequestId);
      }
      setMessages(msgRes.data);
    });

    startConnection().then((conn) => {
      conn.on("ReceiveMessage", (msg: MessageDto) => {
        setMessages((prev) => [...prev, msg]);
      });
      conn.on("ContactShared", () => {
        if (conv) fetchContact(conv.matchRequestId);
      });
      conn.invoke("JoinConversation", id).catch(() => {});
    });
  }, [id, user, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchContact(matchRequestId: string) {
    try {
      const r = await api.get<ContactDto>(`/matchrequests/${matchRequestId}/contact`);
      setContact(r.data);
    } catch {}
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const conn = await startConnection();
      await conn.invoke("SendMessage", id, input.trim());
      setInput("");
    } finally {
      setSending(false);
    }
  }

  async function shareContact() {
    if (!conv) return;
    setSharingContact(true);
    try {
      await api.post(`/matchrequests/${conv.matchRequestId}/share-contact`);
      await fetchContact(conv.matchRequestId);
    } finally {
      setSharingContact(false);
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3 shrink-0">
        <button onClick={() => router.push("/mesajlar")}
          className="text-gray-400 hover:text-teal-600 transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
          {otherName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{otherName}</p>
          <div className="flex items-center gap-2">
            <VerifiedBadges email={otherEmailVerified} tc={otherTcVerified} />
          </div>
        </div>
        <button onClick={() => setShowReport(true)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 shrink-0" title="Şikayet et">
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Contact banner */}
      {contact && (
        <div className={`mx-4 mt-3 rounded-xl text-sm shrink-0 ${
          contact.isShared
            ? "bg-green-50 border border-green-100 p-3"
            : "bg-white border border-gray-100 shadow-sm p-3"
        }`}>
          {contact.isShared ? (
            <div className="space-y-1.5">
              <p className="font-semibold text-green-800 flex items-center gap-1.5 text-xs">
                <Share2 className="w-3.5 h-3.5" /> İletişim Bilgileri Paylaşıldı
              </p>
              {contact.phone && (
                <a href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-green-700 hover:text-green-900">
                  <Phone className="w-3.5 h-3.5" /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-green-700 hover:text-green-900">
                  <Mail className="w-3.5 h-3.5" /> {contact.email}
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Lock className="w-3.5 h-3.5" />
                {isDriver
                  ? "İletişim bilgilerini paylaşmak için onay verin."
                  : "Sürücü iletişim bilgilerini henüz paylaşmadı."}
              </div>
              {isDriver && (
                <button onClick={shareContact} disabled={sharingContact}
                  className="btn-primary py-1.5 px-3 text-xs shrink-0">
                  {sharingContact ? "..." : "Bilgilerimi Paylaş"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Henüz mesaj yok. İlk mesajı siz gönderin!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] group`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-teal-500 text-white rounded-br-md"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] mt-1 ${isMe ? "text-right text-gray-400" : "text-gray-400"}`}>
                  {new Date(msg.sentAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesaj yaz..."
            maxLength={2000}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {showReport && otherId && (
        <ReportModal reportedUserId={otherId} targetName={otherName} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

export default function KonusmaSayfasi() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full" />
      </div>
    }>
      <KonusmaInner />
    </Suspense>
  );
}
