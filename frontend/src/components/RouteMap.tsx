"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationDto } from "@/types";

interface Props {
  origin: LocationDto;
  destination: LocationDto;
  onRouteInfo?: (info: { distanceKm: number; durationMin: number }) => void;
}

declare global {
  interface Window {
    google: typeof google;
    _mapsLoaded?: boolean;
    _mapsLoading?: Promise<void>;
  }
}

async function loadGoogleMaps(): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") return false;
  if (typeof window === "undefined") return false;
  if (window._mapsLoaded) return true;

  if (!window._mapsLoading) {
    window._mapsLoading = new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        window._mapsLoaded = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`;
      script.async = true;
      script.defer = true;
      script.onload = () => { window._mapsLoaded = true; resolve(); };
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }
  await window._mapsLoading;
  return true;
}

export default function RouteMap({ origin, destination, onRouteInfo }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const loaded = await loadGoogleMaps().catch(() => false);
      if (!loaded || cancelled || !mapRef.current) {
        setStatus("error");
        return;
      }

      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: origin.lat, lng: origin.lng },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "simplified" }] },
        ],
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#14b8a6", strokeWeight: 5 },
      });

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
          region: "tr",
        },
        (result, status) => {
          if (cancelled) return;
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);

            // Mesafe ve süre bilgisini parent'a ilet
            const leg = result.routes[0]?.legs[0];
            if (leg && onRouteInfo) {
              onRouteInfo({
                distanceKm: Math.round((leg.distance?.value ?? 0) / 100) / 10,
                durationMin: Math.round((leg.duration?.value ?? 0) / 60),
              });
            }

            // Başlangıç marker
            new google.maps.Marker({
              position: { lat: origin.lat, lng: origin.lng },
              map,
              title: "Ev",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: "#22c55e",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              },
            });

            // Bitiş marker
            new google.maps.Marker({
              position: { lat: destination.lat, lng: destination.lng },
              map,
              title: "İş",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              },
            });

            setStatus("ok");
          } else {
            // Rota çizilemezse sadece iki marker göster
            new google.maps.Marker({ position: { lat: origin.lat, lng: origin.lng }, map, title: "Ev" });
            new google.maps.Marker({ position: { lat: destination.lat, lng: destination.lng }, map, title: "İş" });

            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: origin.lat, lng: origin.lng });
            bounds.extend({ lat: destination.lat, lng: destination.lng });
            map.fitBounds(bounds);
            setStatus("ok");
          }
        }
      );
    }

    init();
    return () => { cancelled = true; };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {status === "loading" && (
        <div className="h-52 flex items-center justify-center bg-gray-50">
          <div className="animate-spin w-6 h-6 border-3 border-teal-400 border-t-transparent rounded-full" />
          <span className="ml-3 text-sm text-gray-400">Harita yükleniyor...</span>
        </div>
      )}
      {status === "error" && (
        <div className="h-52 flex items-center justify-center bg-gray-50 text-sm text-gray-400">
          Harita yüklenemedi.
        </div>
      )}
      <div
        ref={mapRef}
        className={status === "ok" ? "h-52 w-full" : "h-0 w-0 overflow-hidden"}
      />
    </div>
  );
}
