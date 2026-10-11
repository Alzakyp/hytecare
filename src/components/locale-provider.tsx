"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Locale = "id" | "en";
const LocaleContext = createContext({ locale: "id" as Locale, changeLocale: (_locale: Locale) => {} });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hytecare-language");
      if (saved === "en" || saved === "id") setLocale(saved);
    } catch { /* Browser storage may be disabled; Indonesian stays the default. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  function changeLocale(value: Locale) {
    setLocale(value);
    try { localStorage.setItem("hytecare-language", value); } catch { /* Selection still works for this session. */ }
  }
  return <LocaleContext.Provider value={{ locale, changeLocale }}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

export function LocaleSwitch() {
  const { locale, changeLocale } = useLocale();
  return <label className="locale-switch">
    <span>{locale === "id" ? "Bahasa" : "Language"}</span>
    <select value={locale} onChange={(event) => changeLocale(event.target.value === "en" ? "en" : "id")}>
      <option value="id">Indonesia</option><option value="en">English</option>
    </select>
  </label>;
}
