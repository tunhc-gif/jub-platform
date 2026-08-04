"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Gauge } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import NoDataCard from "@/components/NoDataCard";
import { useLanguage } from "@/context/LanguageContext";
import { useVesselData } from "@/context/VesselDataContext";
import { vesselTypes } from "@/data/vesselTypes";
import { vesselIconMap } from "@/components/VesselIcons";

export default function VesselTypeDetailPage({ params }: { params: { type: string } }) {
  const { t, locale } = useLanguage();
  const { vesselsForType } = useVesselData();
  const vt = vesselTypes.find((v) => v.slug === params.type);

  if (!vt) return notFound();

  const Icon = vesselIconMap[vt.slug];
  const vessels = vesselsForType(vt.slug);

  const name = locale === "vi" ? vt.nameVi : vt.nameEn;
  const desc = locale === "vi" ? vt.descVi : vt.descEn;

  return (
    <div>
      <PageHeader backHref="/vessel" backLabel={t("back")} title={`${vt.code} — ${name}`} subtitle={desc} />

      {vessels.length === 0 && <NoDataCard title={t("noData")} desc={t("noDataDesc")} />}

      {vessels.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vessels.map((v) => (
            <Link
              key={v.id}
              href={`/vessel/${vt.slug}/${v.id}`}
              className="group flex flex-col justify-between rounded-xl2 border border-border bg-surface-2 p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Icon size={22} />
                  </span>
                  <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] text-ink-soft">
                    {v.idFlag}
                  </span>
                </div>
                <p className="brand-headline text-base text-ink">{v.displayName}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{v.idType}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-surface-3 px-2 py-1.5">
                    <p className="text-ink-soft">IMO</p>
                    <p className="font-medium text-ink">{v.idImo || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-surface-3 px-2 py-1.5">
                    <p className="text-ink-soft">DP</p>
                    <p className="font-medium text-ink">{String(v.pwrDpClass).split(" ")[0] || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">
                <Gauge size={12} />
                <span>{t("viewDetail")}</span>
                <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
