"use client";

import { useState } from "react";
import { ImageIcon, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { asset } from "@/lib/asset";

// Ô ảnh tàu: ảnh chính lớn + dải thumbnail. Ảnh nằm ở public/vessel-photos/<imo>/…
export default function VesselPhotos({ photos, name }: { photos: string[]; name: string }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  if (!photos || photos.length === 0) return null;
  const main = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="mb-6 rounded-xl2 border border-border bg-surface-2 p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <ImageIcon size={16} className="text-brand-400" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-400">{t("photosTitle")}</h3>
        <span className="ml-auto text-[11px] text-ink-soft">{photos.length} ảnh</span>
      </div>

      <a
        href={asset(main)}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl border border-border bg-surface"
        title={name}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(main)}
          alt={name}
          loading="lazy"
          className="max-h-[420px] w-full object-contain"
        />
        <span className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100">
          <ExternalLink size={13} />
        </span>
      </a>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p}
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-500" : "border-border hover:border-brand-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(p)} alt={`${name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] italic text-ink-soft">{t("photosSource")}</p>
    </div>
  );
}
