import { WeatherBin, FieldWeather } from "@/data/offshoreAreas";

const KN_TO_MS = 0.514444;

// ---------------------------------------------------------------------------
// Weather-availability engine.
// Inputs are monthly frequency-of-occurrence distributions (one % per bin).
// All functions are pure and work on whatever distribution is supplied, so the
// same math applies to the sample dataset and to real data loaded later.
// ---------------------------------------------------------------------------

export type Severity = "favorable" | "moderate" | "severe";

/** Availability (%) for one month = share of occurrence in bins whose UPPER edge ≤ limit,
 *  plus a partial credit for the bin straddling the limit (linear within the bin). */
export function monthlyAvailability(dist: number[], bins: WeatherBin[], limit: number): number {
  let acc = 0;
  for (let i = 0; i < bins.length; i++) {
    const { from, to } = bins[i];
    const occ = dist[i] ?? 0;
    if (to <= limit) {
      acc += occ; // whole bin is within limit
    } else if (from < limit) {
      // limit falls inside this bin — give linear partial credit
      const span = to - from;
      const frac = span > 0 ? (limit - from) / span : 0;
      acc += occ * Math.max(0, Math.min(1, frac));
    }
  }
  return Math.round(acc * 10) / 10;
}

/** Combined availability assuming wind & wave are statistically INDEPENDENT.
 *  (No co-occurring wind+wave data, so this is an estimate — surface the caveat in UI.) */
export function combinedAvailability(windAvail: number, waveAvail: number): number {
  return Math.round(((windAvail / 100) * (waveAvail / 100)) * 1000) / 10;
}

export function severityFromAvailability(pct: number): Severity {
  if (pct >= 70) return "favorable";
  if (pct >= 45) return "moderate";
  return "severe";
}

/** Typical range = the contiguous set of most-frequent bins covering ≥ ~60% of occurrence. */
export function typicalRange(distByMonth: number[][], bins: WeatherBin[]): { from: number; to: number; label: string } {
  // aggregate across all months
  const agg = bins.map((_, i) => distByMonth.reduce((s, m) => s + (m[i] ?? 0), 0));
  const total = agg.reduce((a, b) => a + b, 0) || 1;
  const norm = agg.map((v) => (v / total) * 100);
  // find modal bin, expand outward until ≥60% covered
  let lo = norm.indexOf(Math.max(...norm));
  let hi = lo;
  let covered = norm[lo];
  while (covered < 60 && (lo > 0 || hi < bins.length - 1)) {
    const left = lo > 0 ? norm[lo - 1] : -1;
    const right = hi < bins.length - 1 ? norm[hi + 1] : -1;
    if (right >= left) {
      hi++;
      covered += norm[hi];
    } else {
      lo--;
      covered += norm[lo];
    }
  }
  return { from: bins[lo].from, to: bins[hi].to, label: `${bins[lo].from}–${bins[hi].to}` };
}

/** Mean value of a monthly distribution (bin midpoints weighted by occurrence). */
export function distributionMean(dist: number[], bins: WeatherBin[]): number {
  let sum = 0;
  let w = 0;
  for (let i = 0; i < bins.length; i++) {
    const mid = (bins[i].from + bins[i].to) / 2;
    sum += mid * (dist[i] ?? 0);
    w += dist[i] ?? 0;
  }
  return w > 0 ? sum / w : 0;
}

/** Best / severe months by mean condition (lower mean = calmer = better). */
export function seasonExtremes(
  distByMonth: number[][],
  bins: WeatherBin[],
  monthLabels: string[]
): { bestMonths: string[]; severeMonths: string[] } {
  const means = distByMonth.map((m) => distributionMean(m, bins));
  const idx = means.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const best = idx.slice(0, 3).map((x) => x.i).sort((a, b) => a - b);
  const severe = idx.slice(-3).map((x) => x.i).sort((a, b) => a - b);
  return {
    bestMonths: best.map((i) => monthLabels[i]),
    severeMonths: severe.map((i) => monthLabels[i]),
  };
}

/** Cumulative (≤ upper edge) distribution for a month — used by the heatmap "Cumulative" mode. */
export function cumulative(dist: number[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const v of dist) {
    acc += v;
    out.push(Math.round(acc * 10) / 10);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Weather-downtime (campaign) engine.
// Weather downtime for an operation mode = Σ over the campaign months of
//   (days of the period in that month) × exceedance(limit) × probability,
// where exceedance = 1 − combined availability (conditions over the wind OR wave limit).
// ---------------------------------------------------------------------------

/** Days of the [start, finish] period falling in each calendar month (0=Jan..11=Dec),
 *  aggregated across years. Inclusive of both endpoints by whole days. */
export function monthDayCounts(start: Date, finish: Date): number[] {
  const counts = new Array(12).fill(0);
  if (!(start instanceof Date) || isNaN(start.getTime()) || isNaN(finish.getTime()) || finish < start) {
    return counts;
  }
  const d = new Date(start.getTime());
  d.setHours(0, 0, 0, 0);
  const end = new Date(finish.getTime());
  end.setHours(0, 0, 0, 0);
  // cap to a sane horizon to avoid runaway loops
  let guard = 0;
  while (d <= end && guard < 20000) {
    counts[d.getMonth()] += 1;
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return counts;
}

/** Monthly exceedance (%) for a wind+wave limit against a field's distributions.
 *  windLimitKn is in KNOTS; converted to the field's unit internally. */
export function monthlyExceedance(
  weather: FieldWeather,
  monthIdx: number,
  windLimitKn: number,
  hsLimit: number
): number {
  const windLimit = weather.windUnit === "ms" ? windLimitKn * KN_TO_MS : windLimitKn;
  const wa = monthlyAvailability(weather.wind[monthIdx], weather.windBins, windLimit);
  const ha = monthlyAvailability(weather.wave[monthIdx], weather.waveBins, hsLimit);
  const combinedAvail = combinedAvailability(wa, ha);
  return Math.round((100 - combinedAvail) * 10) / 10;
}

/** Weather downtime in DAYS over a period for one mode. */
export function weatherDowntimeDays(
  weather: FieldWeather,
  windLimitKn: number,
  hsLimit: number,
  dayCounts: number[],
  probability = 1
): number {
  let days = 0;
  for (let m = 0; m < 12; m++) {
    if (dayCounts[m] === 0) continue;
    const exc = monthlyExceedance(weather, m, windLimitKn, hsLimit) / 100;
    days += dayCounts[m] * exc * probability;
  }
  return Math.round(days * 100) / 100;
}

export function totalDays(dayCounts: number[]): number {
  return dayCounts.reduce((a, b) => a + b, 0);
}
