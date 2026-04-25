import { createContext, useContext, useEffect, useMemo, useState } from "react";

type RfqMode = "KR" | "OS";
type Lang = "ko" | "en";

type AppContextValue = {
  rfqMode: RfqMode;
  setRfqMode: (mode: RfqMode) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const RFQ_MODE_STORAGE_KEY = "instaquote-rfq-mode";
const LANG_STORAGE_KEY = "instaquote-lang";

const AppContext = createContext<AppContextValue | null>(null);

function readStoredRfqMode(): RfqMode {
  const value = window.localStorage.getItem(RFQ_MODE_STORAGE_KEY);
  return value === "KR" ? "KR" : "OS";
}

function readStoredLang(): Lang {
  const value = window.localStorage.getItem(LANG_STORAGE_KEY);
  return value === "en" ? "en" : "ko";
}

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [rfqMode, setRfqMode] = useState<RfqMode>(() => readStoredRfqMode());
  const [lang, setLang] = useState<Lang>(() => readStoredLang());

  useEffect(() => {
    window.localStorage.setItem(RFQ_MODE_STORAGE_KEY, rfqMode);
  }, [rfqMode]);

  useEffect(() => {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo(
    () => ({
      rfqMode,
      setRfqMode,
      lang,
      setLang,
    }),
    [lang, rfqMode],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return value;
}
