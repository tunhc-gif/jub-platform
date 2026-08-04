"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/context/LanguageContext";
import { offshoreCountries, fieldsForCountry, countryHasData } from "@/data/offshoreAreas";

export default function OffshoreAreaPage() {
  const { t, locale } = useLanguage();

  return (
    <div>
      <PageHeader
        backHref="/"
        backLabel={t("backHome")}
        title={t("countriesTitle")}
        subtitle={t("countriesSubtitle")}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {offshoreCountries.map((c) => {
          const fieldCount = fieldsForCountry(c.slug).length;
          const hasData = countryHasData(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/offshore-area/${c.slug}`}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl2 border border-border bg-surface-2 p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand-500"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-3 text-4xl">
                {c.flag}
              </span>
              <p className="mt-1 text-sm font-semibold text-ink">{locale === "vi" ? c.nameVi : c.nameEn}</p>
              <p className="text-[11px] text-ink-soft">{c.region}</p>
              {hasData ? (
                <span className="mt-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
                  {fieldCount} {t("fieldCount")}
                </span>
              ) : (
                <span className="mt-1 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                  {t("noData")}
                </span>
              )}
              <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">
                {t("viewDetail")}
                <ChevronRight size={12} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
