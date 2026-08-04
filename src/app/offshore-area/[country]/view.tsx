"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Wind, Waves, CalendarDays } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import NoDataCard from "@/components/NoDataCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  offshoreCountries,
  fieldsForCountry,
  getFieldWeather,
  windUnitLabel,
  MONTHS,
  OffshoreField,
} from "@/data/offshoreAreas";
import { typicalRange, seasonExtremes, severityFromAvailability, monthlyAvailability, combinedAvailability } from "@/lib/weather";

function SeverityBadge({ pct }: { pct: number }) {
  const sev = severityFromAvailability(pct);
  const map = {
    favorable: "bg-emerald-500/15 text-emerald-400",
    moderate: "bg-amber-500/15 text-amber-400",
    severe: "bg-accent/15 text-accent",
  } as const;
  const label = { favorable: "Favorable", moderate: "Moderate", severe: "Severe" } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${map[sev]}`}>{label[sev]}</span>;
}

function FieldCard({ field }: { field: OffshoreField }) {
  const { t, locale } = useLanguage();
  const w = getFieldWeather(field.slug);
  const name = locale === "vi" ? field.nameVi : field.nameEn;

  let summary: {
    wind: string;
    wave: string;
    best: string;
    annual: number;
  } | null = null;

  if (w) {
    const wr = typicalRange(w.wind, w.windBins);
    const hr = typicalRange(w.wave, w.waveBins);
    const { bestMonths } = seasonExtremes(w.wave, w.waveBins, MONTHS);
    // annual combined availability at each field's default operational limit
    const wLim = field.defaultWindLimit ?? (w.windUnit === "ms" ? 12 : 20);
    const hLim = field.defaultHsLimit ?? 1.5;
    let acc = 0;
    for (let m = 0; m < 12; m++) {
      const wa = monthlyAvailability(w.wind[m], w.windBins, wLim);
      const ha = monthlyAvailability(w.wave[m], w.waveBins, hLim);
      acc += combinedAvailability(wa, ha);
    }
    summary = {
      wind: `${wr.label} ${windUnitLabel(w.windUnit)}`,
      wave: `${hr.label} m`,
      best: bestMonths.join(", "),
      annual: Math.round(acc / 12),
    };
  }

  return (
    <Link
      href={`/offshore-area/${field.countrySlug}/${field.slug}`}
      className="group flex flex-col justify-between rounded-xl2 border border-border bg-surface-2 p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500"
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="brand-headline text-base text-ink">{name}</p>
          {summary && <SeverityBadge pct={summary.annual} />}
        </div>
        <p className="text-xs text-ink-soft">{field.region}</p>

        {summary ? (
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-ink-soft">
              <Wind size={13} className="text-brand-400" />
              <span>{t("typicalWind")}:</span>
              <span className="font-medium text-ink">{summary.wind}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft">
              <Waves size={13} className="text-brand-400" />
              <span>{t("typicalWave")}:</span>
              <span className="font-medium text-ink">{summary.wave}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft">
              <CalendarDays size={13} className="text-brand-400" />
              <span>{t("bestSeason")}:</span>
              <span className="font-medium text-ink">{summary.best}</span>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-ink-soft">{t("noData")}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">
        <span>{t("viewDetail")}</span>
        <ChevronRight size={12} />
      </div>
    </Link>
  );
}

export default function CountryDetailPage({ params }: { params: { country: string } }) {
  const { t, locale } = useLanguage();
  const country = offshoreCountries.find((c) => c.slug === params.country);

  if (!country) return notFound();

  const name = locale === "vi" ? country.nameVi : country.nameEn;
  const fields = fieldsForCountry(country.slug);

  // group by region label, preserving field order
  const regions: { region: string; items: OffshoreField[] }[] = [];
  for (const f of fields) {
    let g = regions.find((r) => r.region === f.region);
    if (!g) {
      g = { region: f.region, items: [] };
      regions.push(g);
    }
    g.items.push(f);
  }

  return (
    <div>
      <PageHeader
        backHref="/offshore-area"
        backLabel={t("back")}
        title={`${country.flag} ${name}`}
        subtitle={country.region}
      />

      {fields.length === 0 && <NoDataCard title={t("noData")} desc={t("noDataDesc")} />}

      <div className="space-y-8">
        {regions.map((g) => (
          <div key={g.region}>
            <div className="mb-3 flex items-center gap-3">
              <span className="diagonal-tag h-5 w-2.5 shrink-0 bg-accent" />
              <h2 className="brand-headline text-sm text-ink">{g.region}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((f) => (
                <FieldCard key={f.slug} field={f} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
