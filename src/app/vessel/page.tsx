"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useVesselData } from "@/context/VesselDataContext";
import { vesselTypes } from "@/data/vesselTypes";
import { vesselIconMap } from "@/components/VesselIcons";

export default function VesselTypesPage() {
  const { t, locale } = useLanguage();
  const { vesselsByType } = useVesselData();

  return (
    <div>
      <PageHeader
        backHref="/"
        backLabel={t("backHome")}
        title={t("vesselTypesTitle")}
        subtitle={t("vesselTypesSubtitle")}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {vesselTypes.map((vt) => {
          const Icon = vesselIconMap[vt.slug];
          const count = vesselsByType[vt.slug]?.length ?? 0;
          return (
          <Link
            key={vt.slug}
            href={`/vessel/${vt.slug}`}
            className="group flex flex-col justify-between rounded-xl2 border border-border bg-surface-2 p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500"
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Icon size={20} />
                </span>
                {count > 0 ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
                    {count} {t("vesselCount")}
                  </span>
                ) : (
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                    {t("noData")}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-400">{vt.code}</p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {locale === "vi" ? vt.nameVi : vt.nameEn}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{locale === "vi" ? vt.descVi : vt.descEn}</p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">
              <span>{t("viewDetail")}</span>
              <ChevronRight size={12} />
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
