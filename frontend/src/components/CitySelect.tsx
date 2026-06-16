"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

export const TURKISH_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara",
  "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman",
  "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne",
  "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun",
  "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
  "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
  "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya",
  "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde",
  "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt",
  "Sinop", "Şırnak", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli",
  "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
];

interface Props {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function CitySelect({ value, onChange, placeholder = "Şehir seç...", required }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = TURKISH_CITIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`input flex items-center justify-between gap-2 text-left ${!value ? "text-gray-400" : "text-gray-900"}`}
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Arama */}
          <div className="p-2 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Şehir ara..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-52 overflow-y-auto">
            {!required && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 border-b border-gray-50"
              >
                Tümü
              </button>
            )}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">Sonuç bulunamadı</p>
            )}
            {filtered.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => { onChange(city); setOpen(false); setSearch(""); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                  value === city ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-700"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
