"use client";

import { useState, useEffect } from "react";
import type { Lang } from "./i18n";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "tr" || stored === "en") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  return [lang, setLang];
}
