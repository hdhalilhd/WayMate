"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search } from "lucide-react";
import type { LocationDto } from "@/types";

interface Props {
  label: string;
  placeholder?: string;
  iconColor?: string;
  value: LocationDto | null;
  onChange: (loc: LocationDto) => void;
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
  if (window._mapsLoaded) return true;

  if (!window._mapsLoading) {
    window._mapsLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`;
      script.async = true;
      script.defer = true;
      script.onload = () => { window._mapsLoaded = true; resolve(); };
      script.onerror = () => reject(new Error("Google Maps yüklenemedi"));
      document.head.appendChild(script);
    });
  }
  await window._mapsLoading;
  return true;
}

export default function AddressInput({ label, placeholder, iconColor = "text-teal-500", value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value?.addressText || "");
  const [mapsAvailable, setMapsAvailable] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const initAutocomplete = useCallback(async () => {
    const loaded = await loadGoogleMaps().catch(() => false);
    if (!loaded || !inputRef.current) return;
    setMapsAvailable(true);

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "tr" },
      fields: ["geometry", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;
      const loc: LocationDto = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        addressText: place.formatted_address || inputRef.current?.value || "",
      };
      setInputValue(loc.addressText);
      setSuggestions([]);
      onChange(loc);
    });
  }, [onChange]);

  useEffect(() => {
    initAutocomplete();
  }, [initAutocomplete]);

  // Google Maps yoksa manuel koordinat denemesi (Nominatim OpenStreetMap)
  async function searchManual(query: string) {
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Türkiye")}&format=json&limit=4&addressdetails=1`,
        { headers: { "Accept-Language": "tr" } }
      );
      const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>;
      setSuggestions(data.map((d) => d.display_name));

      // onChange'i ilk sonuçla çağır (en iyi eşleşme)
      if (data.length > 0) {
        onChange({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          addressText: query,
        });
      }
    } catch {}
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    if (!mapsAvailable) {
      setShowSuggestions(true);
      searchManual(e.target.value);
    }
  }

  function selectSuggestion(s: string) {
    setInputValue(s);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder || "Adres ara..."}
          className="input pl-10"
          autoComplete="off"
        />
        {!mapsAvailable && inputValue.length > 2 && (
          <button
            type="button"
            onClick={() => searchManual(inputValue)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown (Nominatim fallback) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => selectSuggestion(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-start gap-2 border-b border-gray-50 last:border-0"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{s}</span>
            </button>
          ))}
        </div>
      )}

      {!mapsAvailable && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <span>⚠</span> Google Maps API key girilmemiş — OpenStreetMap kullanılıyor.
        </p>
      )}
    </div>
  );
}
