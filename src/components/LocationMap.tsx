"use client";

import { useState } from "react";
import { MapPin, Search, ExternalLink, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Embedded location map for an offshore field.
// - Shows a Google Maps embed centred on the field's coordinates.
// - Lets the user type any coordinates or place name and look it up in-place.
// - Keyless: uses the classic `maps.google.com?output=embed` embed + external links.
export default function LocationMap({
  lat,
  lng,
  name,
}: {
  lat?: number;
  lng?: number;
  name: string;
}) {
  const { t, locale } = useLanguage();
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const home = hasCoords ? `${lat}, ${lng}` : "";

  const [input, setInput] = useState(home);
  const [query, setQuery] = useState(home);

  if (!hasCoords) {
    return (
      <div className="rounded-xl2 border border-dashed border-border bg-surface-2 p-6 text-center text-xs text-ink-soft">
        {t("mapNoCoords")}
      </div>
    );
  }

  const q = encodeURIComponent(query || home);
  const embedSrc = `https://maps.google.com/maps?q=${q}&z=8&hl=${locale}&output=embed`;
  const gmapsHref = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const osmHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=8/${lat}/${lng}`;

  const submit = () => setQuery(input.trim() || home);

  return (
    <div className="rounded-xl2 border border-border bg-surface-2 p-4">
      {/* Search row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
          <MapPin size={15} className="shrink-0 text-brand-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={t("mapSearchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-xs text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />
        </div>
        <button
          onClick={submit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
        >
          <Search size={13} />
          {t("mapSearchBtn")}
        </button>
        {query !== home && (
          <button
            onClick={() => {
              setInput(home);
              setQuery(home);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-ink"
          >
            <RotateCcw size={13} />
            {t("mapReset")}
          </button>
        )}
      </div>

      {/* Map embed */}
      <div className="overflow-hidden rounded-xl border border-border">
        <iframe
          key={embedSrc}
          title={`${t("mapTitle")} — ${name}`}
          src={embedSrc}
          className="h-[320px] w-full sm:h-[380px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* External links + note */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
        <a
          href={gmapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-brand-500 hover:text-brand-600"
        >
          {t("mapOpenGoogle")}
          <ExternalLink size={11} />
        </a>
        <a
          href={osmHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-brand-500 hover:text-brand-600"
        >
          {t("mapOpenOsm")}
          <ExternalLink size={11} />
        </a>
        <span className="text-ink-soft">{t("mapNote")}</span>
      </div>
    </div>
  );
}
