"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { startConnection } from "@/lib/signalr";
import type { NotificationDto } from "@/types";

export default function NotificationBell() {
  const router = useRouter();
  const user = getUser();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    api.get<NotificationDto[]>("/notifications").then(r => setNotifications(r.data));

    // SignalR ile anlık bildirim
    startConnection().then(conn => {
      conn.on("NewNotification", (n: NotificationDto) => {
        setNotifications(prev => [n, ...prev]);
        // Tarayıcı bildirimi
        if (Notification.permission === "granted") {
          new Notification("WayMate", { body: n.title, icon: "/favicon.ico" });
        }
      });
    });

    // Tarayıcı bildirim izni iste
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await api.post("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  async function clickNotification(n: NotificationDto) {
    if (!n.isRead) {
      await api.post(`/notifications/${n.id}/read`);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    }
    setOpen(false);
    if (n.listingId) router.push(`/ilan?id=${n.listingId}`);
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
        title="Bildirimler"
      >
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="font-semibold text-gray-900 text-sm">Bildirimler</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-teal-600 hover:underline font-medium">
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Henüz bildirim yok</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => clickNotification(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    !n.isRead ? "bg-teal-50/50" : ""
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-teal-500" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("tr-TR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  {n.listingId && (
                    <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                      İlan
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
