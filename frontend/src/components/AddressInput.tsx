"use client";

import { useEffect, useRef, useState } from "react";
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

// NOT: Adres otomatik tamamlama, ücretsiz ve faturalandırma gerektirmeyen
// OpenStreetMap (Nominatim) ile yapılır. Google'ın eski Places Autocomplete
// bileşeni yeni projelerde kullanılamadığı ve faturalandırma gerektirdiği için
// burada Google kullanılmaz. (Rota haritası — RouteMap — Google kullanmaya devam eder.)
export default function AddressInput({ label, placeholder, iconColor = "text-teal-500", value, onChange }: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputValue, setInputValue] = useState(value?.addressText || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dışarıdan gelen değer değişince (düzenleme modunda ilan yüklenince) input'u senkronla
  useEffect(() => {
    if (value?.addressText) setInputValue(value.addressText);
  }, [value?.addressText]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  async function searchNominatim(query: string) {
    if (query.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Türkiye")}&format=json&limit=6&addressdetails=1`,
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
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
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
    debounceRef.current = setTimeout(() => searchNominatim(val), 400);
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
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
          placeholder={placeholder || "Adres ara..."}
          className="input pl-10"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-72 overflow-y-auto">
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
