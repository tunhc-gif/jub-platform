import { JubVessel } from "@/data/jubVessels";

// ---------------------------------------------------------------------------
// Default weather operating limits by vessel type, per operation mode.
// Hs in metres, wind in KNOTS. Applied to "typical" vessels or vessels without
// their own documented sea/wind limits; a vessel with explicit limits overrides.
// (Seeded from the POS Weather-downtime format: JUB, OCV, Workboat are from the
//  reference table; the others are typical planning assumptions — edit as needed.)
// ---------------------------------------------------------------------------
export type ModeLimit = { hs: number; windKn: number };
export type TypeLimits = { relocation: ModeLimit; working: ModeLimit; fromReference: boolean };

export const defaultLimitsByType: Record<string, TypeLimits> = {
  jub: { relocation: { hs: 1.5, windKn: 20 }, working: { hs: 3.0, windKn: 40 }, fromReference: true },
  ocv: { relocation: { hs: 1.8, windKn: 19 }, working: { hs: 2.0, windKn: 25 }, fromReference: true },
  workboat: { relocation: { hs: 1.8, windKn: 20 }, working: { hs: 1.8, windKn: 20 }, fromReference: true },
  hlv: { relocation: { hs: 2.0, windKn: 25 }, working: { hs: 2.5, windKn: 30 }, fromReference: false },
  dsv: { relocation: { hs: 2.0, windKn: 25 }, working: { hs: 1.5, windKn: 20 }, fromReference: false },
  dlb: { relocation: { hs: 2.0, windKn: 25 }, working: { hs: 2.5, windKn: 30 }, fromReference: false },
  "floatover-barge": { relocation: { hs: 1.5, windKn: 20 }, working: { hs: 2.0, windKn: 25 }, fromReference: false },
  floatel: { relocation: { hs: 1.5, windKn: 20 }, working: { hs: 2.0, windKn: 25 }, fromReference: false },
  "supply-boat": { relocation: { hs: 2.5, windKn: 30 }, working: { hs: 2.0, windKn: 25 }, fromReference: false },
  crewboat: { relocation: { hs: 2.0, windKn: 25 }, working: { hs: 1.5, windKn: 20 }, fromReference: false },
};

// Mechanical-downtime coefficients (percent), estimated from vessel age.
// Editable via Google Sheets (rows mechRateUnder10 / mechRate10to15 /
// mechRateOver15 / mechRateUnknown / mechAgeLow / mechAgeHigh).
export type MechConfig = {
  ageLow: number; // years
  ageHigh: number; // years
  rateUnder: number; // % for age < ageLow
  rateMid: number; // % for ageLow ≤ age ≤ ageHigh
  rateOver: number; // % for age > ageHigh
  rateUnknown: number; // % when build year unknown or "typical"
};

export const defaultMechConfig: MechConfig = {
  ageLow: 10,
  ageHigh: 15,
  rateUnder: 1,
  rateMid: 2,
  rateOver: 3,
  rateUnknown: 2.5,
};

/**
 * Mechanical-downtime rate (fraction, e.g. 0.025).
 * FLAT rate for every vessel — the age-tier model was judged unsuitable, so we
 * apply a single uniform coefficient (default 2.5%). buildYear/referenceYear are
 * kept in the signature for call-site compatibility but no longer affect the rate.
 * The value is driven by cfg.rateUnknown (editable via the Google Sheet).
 */
export function mechanicalRate(
  buildYear: number | null,
  referenceYear: number,
  cfg: MechConfig = defaultMechConfig
): number {
  void buildYear;
  void referenceYear;
  return cfg.rateUnknown / 100;
}

/** Read mechanical coefficients from CSV rows (type = mech key, value column). */
export function mechFromCsvRows(rows: Record<string, string>[]): MechConfig {
  const cfg: MechConfig = { ...defaultMechConfig };
  const num = (v: string) => {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    return isNaN(n) ? null : n;
  };
  for (const r of rows) {
    const key = (r.type || "").trim();
    const val = num(r.value);
    if (val === null) continue;
    if (key === "mechRateUnder10") cfg.rateUnder = val;
    else if (key === "mechRate10to15") cfg.rateMid = val;
    else if (key === "mechRateOver15") cfg.rateOver = val;
    else if (key === "mechRateUnknown") cfg.rateUnknown = val;
    else if (key === "mechAgeLow") cfg.ageLow = val;
    else if (key === "mechAgeHigh") cfg.ageHigh = val;
  }
  return cfg;
}

/** Build a type→limits table from parsed CSV rows (columns: type, relocationHs,
 *  relocationWindKn, workingHs, workingWindKn). Rows with a bad/empty type or
 *  non-numeric values are skipped. Returns null if nothing usable was parsed. */
export function limitsFromCsvRows(rows: Record<string, string>[]): Record<string, TypeLimits> | null {
  const out: Record<string, TypeLimits> = {};
  const num = (v: string) => {
    const n = parseFloat(String(v ?? "").replace(",", "."));
    return isNaN(n) ? null : n;
  };
  for (const r of rows) {
    const type = (r.type || "").trim().toLowerCase();
    if (!type) continue;
    const rHs = num(r.relocationHs), rW = num(r.relocationWindKn);
    const wHs = num(r.workingHs), wW = num(r.workingWindKn);
    if (rHs === null || rW === null || wHs === null || wW === null) continue;
    out[type] = {
      relocation: { hs: rHs, windKn: rW },
      working: { hs: wHs, windKn: wW },
      fromReference: true,
    };
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Parse a 4-digit build year from a messy idYear string; null if not found. */
export function parseBuildYear(idYear: string | number | undefined): number | null {
  if (idYear === undefined || idYear === null) return null;
  const m = String(idYear).match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : null;
}

/** A plain numeric value (e.g. "20", "2.5") → number; otherwise null (free text). */
function pureNum(v: string | number | undefined): number | null {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const s = v.trim().replace(",", ".");
  return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null;
}

export type ResolvedLimits = {
  relocation: ModeLimit;
  working: ModeLimit;
  relocationSource: "vessel" | "type";
  workingSource: "vessel" | "type";
};

/** Resolve the limits to use: a vessel's own documented limits where numerically
 *  clear, otherwise the type-default table. `vessel` is null for a "typical" vessel. */
export function resolveLimits(
  vessel: JubVessel | null,
  typeSlug: string,
  table: Record<string, TypeLimits> = defaultLimitsByType
): ResolvedLimits {
  const def = table[typeSlug] ?? defaultLimitsByType[typeSlug] ?? defaultLimitsByType.jub;
  const out: ResolvedLimits = {
    relocation: { ...def.relocation },
    working: { ...def.working },
    relocationSource: "type",
    workingSource: "type",
  };
  if (!vessel) return out;

  // Relocation / positioning / move: field-move limits (Hs m, wind kn)
  const rWave = pureNum(vessel.opsFieldmoveWaveM);
  const rWind = pureNum(vessel.opsFieldmoveWindKn);
  if (rWave !== null && rWind !== null) {
    out.relocation = { hs: rWave, windKn: rWind };
    out.relocationSource = "vessel";
  }

  // Working: crane operating wind (kn? often m/s in source) — only override wind
  // when clearly numeric; keep type-default Hs (no clean per-vessel working Hs).
  const wWind = pureNum(vessel.opsCraneWind);
  if (wWind !== null) {
    // opsCraneWind on JUB manuals is typically m/s; convert to knots for the table.
    out.working = { hs: def.working.hs, windKn: Math.round(wWind * 1.94384 * 10) / 10 };
    out.workingSource = "vessel";
  }
  return out;
}
