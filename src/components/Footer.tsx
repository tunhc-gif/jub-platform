"use client";

import { Anchor, Cloud, HardDrive } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useVesselData } from "@/context/VesselDataContext";

export default function Footer() {
  const { t } = useLanguage();
  const { source, allVessels } = useVesselData();
  const live = source === "remote";

  return (
    <footer className="relative mt-16 bg-brand-900 text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white">
            <Anchor size={16} />
          </span>
          <div className="leading-tight">
            <p className="brand-headline text-xs text-white">{t("appName")}</p>
            <p className="text-[11px] text-white/60">{t("tagline")}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 sm:items-end">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80"
            title={live ? t("dataSourceLiveHint") : t("dataSourceBundledHint")}
          >
            {live ? <Cloud size={12} /> : <HardDrive size={12} />}
            {live ? t("dataSourceLive") : t("dataSourceBundled")} · {allVessels.length} {t("vesselCount")}
          </span>
          <p className="text-[11px] text-white/50">
            © 2026 PTSC Offshore Services (POS) — {t("footerNote")}
          </p>
          <p className="text-[11px] text-white/50">
            {t("footerDevBy")}{" "}
            <a
              href="mailto:Tunhc@ptsc.com.vn"
              className="font-medium text-white/70 underline decoration-white/30 underline-offset-2 transition hover:text-accent"
            >
              Tunhc@ptsc.com.vn
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
