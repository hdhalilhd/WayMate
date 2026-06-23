"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import type { LocationDto } from "@/types";

interface Props {
  label: string;
  placeholder?: string;
  iconColor?: string;
  value: LocationDto | null;
  onChange: (loc: LocationDto) => void;
}

interface Suggestion {
  display: string;
  lat: number;
  lng: number;
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputValue, setInputValue] = useState(value?.addressText || "");
  const [mapsAvailable, setMapsAvailable] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
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
      setShowSuggestions(false);
      onChange(loc);
    });
  }, [onChange]);

  useEffect(() => {
    initAutocomplete();
  }, [initAutocomplete]);

  // Dışarıdan gelen değer değişince (örn. düzenleme modunda ilan yüklenince) input'u senkronla.
  // value.addressText yalnızca seçim yapıldığında değiştiği için yazarken tetiklenmez.
  useEffect(() => {
    if (value?.addressText) setInputValue(value.addressText);
  }, [value?.addressText]);

  // Debounce temizliği
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Nominatim (OpenStreetMap) — Google çalışmadığında güvenlik ağı
  async function searchNominatim(query: string) {
    if (query.trim().length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Türkiye")}&format=json&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "tr" } }
      );
      const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>;
      const mapped: Suggestion[] = data.map((d) => ({
        display: d.display_name,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
      }));
      setSuggestions(mapped);
      setShowSuggestions(mapped.length > 0);
    } catch {
      /* ağ hatası — sessizce geç */
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      // Google yüklüyse ve kendi önerilerini gösteriyorsa (faturalandırma açık),
      // bizim açılır listemizi gizle — çift liste olmasın.
      if (mapsAvailable && document.querySelector(".pac-container .pac-item")) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      // Google yok ya da öneri döndürmedi → Nominatim güvenlik ağı
      searchNominatim(val);
    }, 450);
  }

  function selectSuggestion(s: Suggestion) {
    setInputValue(s.display);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({ lat: s.lat, lng: s.lng, addressText: s.display });
  }

  return (
    <div className="relative">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
          placeholder={placeholder || "Adres ara..."}
          className="input pl-10"
          autoComplete="off"
        />
      </div>

      {/* Öneri açılır listesi (Nominatim güvenlik ağı) */}
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
              <span className="line-clamp-2">{s.display}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
