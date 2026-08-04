"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "pos" | "ocean" | "sunset" | "emerald" | "slate";

export const themes: { code: ThemeName; label: string; swatch: string }[] = [
  { code: "pos", label: "PTSC Offshore (POS)", swatch: "#0f3460" },
  { code: "ocean", label: "Ocean", swatch: "#2f7dff" },
  { code: "sunset", label: "Sunset", swatch: "#f9701a" },
  { code: "emerald", label: "Emerald", swatch: "#17b57c" },
  { code: "slate", label: "Slate (Light)", swatch: "#4a5cb8" },
];

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "jub-platform-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("pos");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (saved) setThemeState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
