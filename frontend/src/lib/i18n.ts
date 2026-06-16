export type Lang = "tr" | "en";

export const translations = {
  tr: {
    findRide: "Araç Bul",
    postRide: "İlan Ver",
    messages: "Mesajlar",
    profile: "Profilim",
    logout: "Çıkış",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    heroTitle: "Evden işe her gün",
    heroSub: "yalnız gitme.",
    heroDesc: "Aynı güzergahı kullanan komşularınla buluş. Yakıt masrafını böl, yolculuğu keyifli hale getir.",
    searchPlaceholderHome: "Ev adresin (nereden?)",
    searchPlaceholderWork: "İş adresin (nereye?)",
    searchBtn: "İlan Ara",
    nearby: "Yakınımdaki İlanlar",
    locating: "Konum alınıyor...",
    allCities: "Tüm şehirler",
    selectCity: "Şehir seç...",
    radius: "Arama Yarıçapı",
    noListing: "İlan bulunamadı",
    noListingDesc: "Arama yarıçapını genişletmeyi dene ya da kendin ilan ver.",
    findRidePage: "Güzergahına uygun araç bul ya da yakınındaki ilanları keşfet.",
  },
  en: {
    findRide: "Find a Ride",
    postRide: "Post a Ride",
    messages: "Messages",
    profile: "My Profile",
    logout: "Sign Out",
    login: "Sign In",
    register: "Sign Up",
    heroTitle: "Stop commuting alone",
    heroSub: "every single day.",
    heroDesc: "Find neighbors who share your route. Split fuel costs and make the commute enjoyable.",
    searchPlaceholderHome: "Home address (from?)",
    searchPlaceholderWork: "Work address (to?)",
    searchBtn: "Search",
    nearby: "Listings Near Me",
    locating: "Getting location...",
    allCities: "All cities",
    selectCity: "Select city...",
    radius: "Search Radius",
    noListing: "No listings found",
    noListingDesc: "Try expanding the search radius or post your own listing.",
    findRidePage: "Find a ride on your route or discover listings near you.",
  },
} as const;

export function t(lang: Lang, key: keyof typeof translations.tr): string {
  return translations[lang][key];
}
