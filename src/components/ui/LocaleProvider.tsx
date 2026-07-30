"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getLocale,
  setLocale,
  subscribeLocale,
  type LocaleCode,
} from "@/locales";

const STORAGE_KEY = "preferred-locale";

type LocaleContextValue = {
  locale: LocaleCode;
  changeLocale: (code: LocaleCode) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  changeLocale: () => {},
});

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

function subscribe(cb: () => void): () => void {
  return subscribeLocale(cb);
}

function getSnapshot(): LocaleCode {
  return getLocale();
}

function getServerSnapshot(): LocaleCode {
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== locale && ["en", "fr", "uk", "nl", "de"].includes(saved)) {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = useCallback((code: LocaleCode) => {
    setLocale(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
