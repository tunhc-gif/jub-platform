"use client";

import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme, themes } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = themes.find((th) => th.code === theme) ?? themes[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-ink-soft transition hover:text-ink hover:border-brand-500"
        title={t("themeLabel")}
      >
        <Palette size={15} />
        <span
          className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20"
          style={{ backgroundColor: current.swatch }}
        />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-border bg-surface-2 p-2 shadow-card">
          {themes.map((th) => (
            <button
              key={th.code}
              onClick={() => {
                setTheme(th.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-surface-3 ${
                th.code === theme ? "text-ink" : "text-ink-soft"
              }`}
            >
              <span
                className="inline-block h-3 w-3 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: th.swatch }}
              />
              {th.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
