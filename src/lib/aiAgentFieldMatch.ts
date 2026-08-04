import { Vessel } from "@/data/vessels";
import { offshoreFields, getFieldWeather, MONTHS, OffshoreField } from "@/data/offshoreAreas";
import { resolveLimits } from "@/data/weatherLimits";
import { monthlyExceedance } from "@/lib/weather";
import { Locale } from "@/lib/i18n";
import { Confidence } from "@/lib/aiAgentQuery";

const MONTH_TOKENS: { idx: number; tokens: string[] }[] = [
  { idx: 0, tokens: ["tháng 1", "thang 1", "jan", "january", "tháng một"] },
  { idx: 1, tokens: ["tháng 2", "thang 2", "feb", "february", "tháng hai"] },
  { idx: 2, tokens: ["tháng 3", "thang 3", "mar", "march", "tháng ba"] },
  { idx: 3, tokens: ["tháng 4", "thang 4", "apr", "april", "tháng tư"] },
  { idx: 4, tokens: ["tháng 5", "thang 5", "may", "tháng năm"] },
  { idx: 5, tokens: ["tháng 6", "thang 6", "jun", "june", "tháng sáu"] },
  { idx: 6, tokens: ["tháng 7", "thang 7", "jul", "july", "tháng bảy"] },
  { idx: 7, tokens: ["tháng 8", "thang 8", "aug", "august", "tháng tám"] },
  { idx: 8, tokens: ["tháng 9", "thang 9", "sep", "september", "tháng chín"] },
  { idx: 9, tokens: ["tháng 10", "thang 10", "oct", "october", "tháng mười"] },
  { idx: 10, tokens: ["tháng 11", "thang 11", "nov", "november", "tháng mười một"] },
  { idx: 11, tokens: ["tháng 12", "thang 12", "dec", "december", "tháng mười hai"] },
];

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Detect an offshore field mentioned in the query (only fields that actually carry weather data). */
export function detectField(query: string): OffshoreField | null {
  const q = normalize(query);
  const candidates = offshoreFields.filter((f) => getFieldWeather(f.slug));
  // Longest-name-first so "thang long dong do" wins over a shorter partial.
  const scored = candidates
    .map((f) => {
      const names = [f.nameVi, f.nameEn, f.slug.replace(/-/g, " ")].map(normalize);
      // also try the bare name without parenthetical, e.g. "lac da vang"
      const bare = names.map((n) => n.replace(/\(.*?\)/g, "").trim());
      const hit = [...names, ...bare].find((n) => n.length >= 3 && q.includes(n));
      return hit ? { f, len: hit.length } : null;
    })
    .filter(Boolean) as { f: OffshoreField; len: number }[];
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.len - a.len);
  return scored[0].f;
}

export function detectMonth(query: string): number | null {
  const q = normalize(query);
  for (const m of MONTH_TOKENS) {
    if (m.tokens.some((t) => q.includes(normalize(t)))) return m.idx;
  }
  return null;
}

export type FieldMatchRow = {
  vessel: Vessel;
  downtimePct: number; // combined weather downtime % (working mode)
  usedVesselLimits: boolean;
};

export type FieldMatchResult = {
  field: OffshoreField;
  monthIdx: number | null; // null = year-average
  rows: FieldMatchRow[]; // sorted ascending by downtime (best first)
  confidence: Confidence;
};

/** Rank vessels by working-mode weather downtime at a field (single month or year-average). */
export function matchVesselsToField(field: OffshoreField, monthIdx: number | null, vessels: Vessel[]): FieldMatchResult {
  const weather = getFieldWeather(field.slug)!;
  let anyTypeDefault = false;

  const rows: FieldMatchRow[] = vessels.map((v) => {
    const lim = resolveLimits(v, String(v.category));
    if (lim.workingSource === "type") anyTypeDefault = true;
    const idxs = monthIdx === null ? Array.from({ length: 12 }, (_, i) => i) : [monthIdx];
    const excs = idxs.map((m) => monthlyExceedance(weather, m, lim.working.windKn, lim.working.hs));
    const downtimePct = Math.round((excs.reduce((a, b) => a + b, 0) / excs.length) * 10) / 10;
    return { vessel: v, downtimePct, usedVesselLimits: lim.workingSource === "vessel" };
  });

  rows.sort((a, b) => a.downtimePct - b.downtimePct);

  const confidence: Confidence = field.sample
    ? { level: "low", reasonVi: "Dữ liệu thời tiết mỏ này là DEMO — chỉ tham khảo.", reasonEn: "This field's weather data is DEMO — indicative only." }
    : anyTypeDefault
    ? {
        level: "medium",
        reasonVi: "Tính trên dữ liệu thời tiết thật, nhưng một số tàu dùng giới hạn mặc định theo loại (thiếu giới hạn riêng trong hồ sơ).",
        reasonEn: "Computed on real field weather, but some vessels use type-default limits (no documented per-vessel limits).",
      }
    : {
        level: "high",
        reasonVi: "Tính trên dữ liệu thời tiết thật của mỏ + giới hạn vận hành riêng của tàu.",
        reasonEn: "Computed on the field's real weather data and each vessel's own operating limits.",
      };

  return { field, monthIdx, rows, confidence };
}

export function monthLabel(idx: number | null, locale: Locale): string {
  if (idx === null) return locale === "vi" ? "trung bình năm" : "year-average";
  return locale === "vi" ? `tháng ${idx + 1}` : MONTHS[idx];
}
