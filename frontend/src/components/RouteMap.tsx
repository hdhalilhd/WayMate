"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationDto } from "@/types";

interface Props {
  origin: LocationDto;
  destination: LocationDto;
  onRouteInfo?: (info: { distanceKm: number; durationMin: number }) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    L?: any;
    _leafletLoading?: Promise<void>;
  }
}

// Leaflet'i CDN'den yükle (ücretsiz, API anahtarı gerekmez)
async function loadLeaflet(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.L) return true;
  if (!window._leafletLoading) {
    window._leafletLoading = new Promise<void>((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-leaflet", "1");
        document.head.appendChild(link);
      }
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("leaflet load failed"));
      document.head.appendChild(s);
    });
  }
  await window._leafletLoading;
  return !!window.L;
}

function haversineKm(a: LocationDto, b: LocationDto): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export default function RouteMap({ origin, destination, onRouteInfo }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const ok = await loadLeaflet().catch(() => false);
      if (!ok || cancelled || !mapRef.current) { setStatus("error"); return; }
      const L = window.L;

      // Önceki haritayı temizle
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }

      const home: [number, number] = [origin.lat, origin.lng];
      const work: [number, number] = [destination.lat, destination.lng];

      const map = L.map(mapRef.current, { zoomControl: true });
      mapObj.current = map;
      map.setView(home, 12); // fitBounds gelene kadar başlangıç görünümü
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.circleMarker(home, { radius: 8, color: "#fff", weight: 2, fillColor: "#22c55e", fillOpacity: 1 }).addTo(map);
      L.circleMarker(work, { radius: 8, color: "#fff", weight: 2, fillColor: "#ef4444", fillOpacity: 1 }).addTo(map);

      setStatus("ok");
      setTimeout(() => map.invalidateSize(), 100);

      // OSRM ile gerçek yol rotası + mesafe/süre (ücretsiz, anahtarsız)
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        if (data.code === "Ok" && data.routes?.[0]) {
          const route = data.routes[0];
          const latlngs = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          const line = L.polyline(latlngs, { color: "#14b8a6", weight: 5 }).addTo(map);
          map.fitBounds(line.getBounds(), { padding: [30, 30] });
          onRouteInfo?.({
            distanceKm: Math.round(route.distance / 100) / 10,
            durationMin: Math.round(route.duration / 60),
          });
          return;
        }
        throw new Error("no route");
      } catch {
        if (cancelled) return;
        // Yol bulunamazsa: düz çizgi + kuş uçuşu mesafe
        const line = L.polyline([home, work], { color: "#14b8a6", weight: 4, dashArray: "6 8" }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [40, 40] });
        onRouteInfo?.({ distanceKm: Math.round(haversineKm(origin, destination) * 10) / 10, durationMin: 0 });
      }
    }

    init();
    return () => {
      cancelled = true;
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm h-52">
      {status !== "ok" && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-50 text-sm text-gray-400">
          {status === "loading" ? (
            <>
              <div className="animate-spin w-6 h-6 border-3 border-teal-400 border-t-transparent rounded-full" />
              <span className="ml-3">Harita yükleniyor...</span>
            </>
          ) : (
            <span>Harita yüklenemedi.</span>
          )}
        </div>
      )}
      <div ref={mapRef} className="h-52 w-full" />
    </div>
  );
}
