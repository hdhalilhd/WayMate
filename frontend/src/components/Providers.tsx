"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createContext, useContext, useState, useEffect } from "react";
import type { Lang } from "@/lib/i18n";

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; }
export const LangContext = createContext<LangCtx>({ lang: "tr", setLang: () => {} });
export const useLangCtx = () => useContext(LangContext);

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");
  useEffect(() => {
    const s = localStorage.getItem("lang") as Lang | null;
    if (s === "tr" || s === "en") setLangState(s);
  }, []);
  function setLang(l: Lang) { setLangState(l); localStorage.setItem("lang", l); }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <LangProvider>{children}</LangProvider>
    </GoogleOAuthProvider>
  );
}
