import { JubVessel } from "@/data/jubVessels";
import { Vessel } from "@/data/vessels";
import { Locale } from "@/lib/i18n";

export type Operator = ">" | ">=" | "<" | "<=" | "=";

export type FieldMatch = {
  field: keyof JubVessel;
  fieldLabelVi: string;
  fieldLabelEn: string;
  operator: Operator;
  value: number;
  unit?: string;
};

export type RangeMatch = {
  field: keyof JubVessel;
  fieldLabelVi: string;
  fieldLabelEn: string;
  min: number;
  max: number;
  unit?: string;
};

export type CategoryKind = "type" | "flag" | "region";

export type Condition =
  | { type: "numeric"; match: FieldMatch }
  | { type: "range"; match: RangeMatch }
  | { type: "dp"; digit: string }
  | { type: "category"; kind: CategoryKind; token: string; labelVi: string; labelEn: string; test: (v: JubVessel) => boolean };

export type SortSpec = { field: keyof JubVessel; labelVi: string; labelEn: string; dir: "asc" | "desc"; unit?: string };

export type Confidence = { level: "high" | "medium" | "low"; reasonVi: string; reasonEn: string };

type FieldConfig = {
  field: keyof JubVessel;
  labelVi: string;
  labelEn: string;
  unit?: string;
  keywords: string[];
};

// Checked in order — specific fields (main/aux crane) before the generic "crane" fallback.
const FIELD_CONFIGS: FieldConfig[] = [
  { field: "craneMainSwl", labelVi: "SWL cẩu chính", labelEn: "main crane SWL", unit: "t", keywords: ["cẩu chính", "cau chinh", "main crane"] },
  { field: "craneAuxSwl", labelVi: "SWL cẩu phụ", labelEn: "aux crane SWL", unit: "t", keywords: ["cẩu phụ", "cau phu", "aux crane", "auxiliary crane"] },
  { field: "bollardPullT", labelVi: "bollard pull", labelEn: "bollard pull", unit: "t", keywords: ["bollard pull", "bollard", "bp", "lực kéo", "luc keo", "sức kéo", "suc keo"] },
  { field: "accPobMax", labelVi: "sức chứa (POB)", labelEn: "max POB", unit: "người", keywords: ["pob", "sức chứa", "suc chua", "chỗ ở", "cho o", "nhân sự", "nhan su", "pax", "accommodation", "người", "nguoi"] },
  { field: "dwt", labelVi: "DWT", labelEn: "DWT", unit: "t", keywords: ["dwt", "trọng tải", "trong tai", "deadweight"] },
  { field: "wtDisplacementLoaded", labelVi: "lượng giãn nước", labelEn: "displacement", unit: "t", keywords: ["giãn nước", "gian nuoc", "displacement", "lượng chiếm nước"] },
  { field: "speedKn", labelVi: "tốc độ", labelEn: "speed", unit: "kn", keywords: ["tốc độ", "toc do", "speed", "hải lý", "hai ly"] },
  { field: "dimLoa", labelVi: "chiều dài (LOA)", labelEn: "length (LOA)", unit: "m", keywords: ["loa", "chiều dài", "chieu dai", "chiều dài lớn nhất", "length", "dài"] },
  { field: "dimWidth", labelVi: "chiều rộng", labelEn: "beam", unit: "m", keywords: ["chiều rộng", "chieu rong", "beam", "bề rộng", "be rong", "rộng"] },
  { field: "idYear", labelVi: "năm đóng", labelEn: "build year", keywords: ["năm đóng", "nam dong", "đóng năm", "dong nam", "build year", "năm sản xuất"] },
  { field: "dimLegsQty", labelVi: "số lượng chân", labelEn: "number of legs", keywords: ["số chân", "so chan", "số lượng chân", "number of legs", "legs"] },
  { field: "craneMainSwl", labelVi: "SWL cẩu", labelEn: "crane SWL", unit: "t", keywords: ["cẩu", "cau", "crane", "swl"] },
];

// ---- Category (type + flag) config ---------------------------------------

type TypeConfig = { token: string; labelVi: string; labelEn: string; categories: string[]; typeKeywords: string[] };

// Match either the vessel's `category` slug OR free-text within idType.
const TYPE_CONFIGS: TypeConfig[] = [
  { token: "ahts", labelVi: "AHTS / OCV", labelEn: "AHTS / OCV", categories: ["ocv"], typeKeywords: ["anchor handling", "ahts", "ocv"] },
  { token: "liftboat", labelVi: "tàu tự nâng / JUB", labelEn: "jack-up / JUB", categories: ["jub"], typeKeywords: ["jack-up", "jack up", "self-elevating", "liftboat", "tự nâng", "jub"] },
  { token: "psv", labelVi: "tàu tiếp vận (PSV)", labelEn: "platform supply (PSV)", categories: ["supply-boat"], typeKeywords: ["platform supply", "psv", "supply vessel"] },
  { token: "crewboat", labelVi: "crewboat", labelEn: "crewboat", categories: ["crewboat"], typeKeywords: ["crew boat", "crewboat", "fast crew"] },
  { token: "accommodation", labelVi: "sà lan ở / accommodation", labelEn: "accommodation barge", categories: ["floatel"], typeKeywords: ["accommodation", "awb", "work barge", "floatel"] },
  { token: "hlv", labelVi: "tàu cẩu / heavy-lift", labelEn: "heavy-lift / crane vessel", categories: ["hlv"], typeKeywords: ["heavy lift", "heavy-lift", "crane vessel", "derrick", "hlv"] },
  { token: "tug", labelVi: "tàu kéo", labelEn: "tug", categories: ["workboat"], typeKeywords: ["tug", "tàu kéo", "towage"] },
];

// Flags/countries commonly present in the fleet.
const FLAG_CONFIGS: { token: string; labelVi: string; labelEn: string; match: string[] }[] = [
  { token: "vietnam", labelVi: "cờ Việt Nam", labelEn: "Vietnam flag", match: ["viet nam", "vietnam", "việt nam"] },
  { token: "malaysia", labelVi: "cờ Malaysia", labelEn: "Malaysia flag", match: ["malaysia"] },
  { token: "singapore", labelVi: "cờ Singapore", labelEn: "Singapore flag", match: ["singapore"] },
  { token: "panama", labelVi: "cờ Panama", labelEn: "Panama flag", match: ["panama"] },
  { token: "indonesia", labelVi: "cờ Indonesia", labelEn: "Indonesia flag", match: ["indonesia"] },
  { token: "bahamas", labelVi: "cờ Bahamas", labelEn: "Bahamas flag", match: ["bahamas"] },
  { token: "marshall", labelVi: "cờ Marshall Islands", labelEn: "Marshall Islands flag", match: ["marshall"] },
];

// Operating/registry REGION — inferred from flag + owner + port of registry (NOT real-time AIS position).
// `triggers` = phrases in the user's query; `signals` = substrings matched against a vessel's
// combined flag/owner/port/build-location text. Flag-of-convenience vessels may go unclassified.
const REGION_CONFIGS: { token: string; labelVi: string; labelEn: string; triggers: string[]; signals: string[] }[] = [
  {
    token: "middle-east",
    labelVi: "khu vực Trung Đông (theo cờ/chủ tàu)",
    labelEn: "Middle East region (by flag/owner)",
    triggers: ["trung đông", "trung dong", "middle east", "gulf", "vùng vịnh", "vung vinh"],
    signals: ["u.a.e", "uae", "united arab", "dubai", "abu dhabi", "sharjah", "fujairah", "qatar", "doha", "saudi", "dammam", "ras tanura", "al khobar", "jubail", "bahrain", "oman", "muscat", "kuwait", "zakher", "rawabi", "adnoc", "npcc", "halul", "milaha"],
  },
  {
    token: "vietnam",
    labelVi: "khu vực Việt Nam (theo cờ/chủ tàu)",
    labelEn: "Vietnam region (by flag/owner)",
    triggers: ["việt nam", "viet nam", "vietnam"],
    signals: ["viet nam", "vietnam", "việt nam", "vung tau", "vũng tàu", "ptsc", "vietsov", "pv drilling", "pvep", "hai phong", "hải phòng", "saigon", "sài gòn"],
  },
  {
    token: "southeast-asia",
    labelVi: "khu vực Đông Nam Á (ngoài VN, theo cờ/chủ tàu)",
    labelEn: "Southeast Asia region (excl. VN, by flag/owner)",
    triggers: ["đông nam á", "dong nam a", "southeast asia", "south east asia", "đna", "dna"],
    signals: ["malaysia", "kuala lumpur", "port kelang", "labuan", "miri", "singapore", "indonesia", "jakarta", "batam", "surabaya", "brunei", "thailand", "bangkok", "songkhla"],
  },
  {
    token: "west-africa",
    labelVi: "khu vực Tây Phi (theo cờ/chủ tàu)",
    labelEn: "West Africa region (by flag/owner)",
    triggers: ["tây phi", "tay phi", "west africa", "nigeria"],
    signals: ["nigeria", "lagos", "onne", "port harcourt", "west africa"],
  },
];

function regionHaystack(v: JubVessel): string {
  return [v.idFlag, v.idOwner, v.idPort, v.idLocation].join(" ").toLowerCase();
}

const OPERATOR_PREFIX: { operator: Operator; patterns: RegExp[] }[] = [
  { operator: ">=", patterns: [/(?:từ|tối thiểu|ít nhất|at least|minimum|min)\s*(\d+(?:[.,]\d+)?)/i, />=\s*(\d+(?:[.,]\d+)?)/] },
  { operator: "<=", patterns: [/(?:tối đa|không quá|at most|maximum|max)\s*(\d+(?:[.,]\d+)?)/i, /<=\s*(\d+(?:[.,]\d+)?)/] },
  { operator: ">", patterns: [/(?:lớn hơn|hơn|trên|vượt quá|vượt|greater than|more than|above|over)\s*(\d+(?:[.,]\d+)?)/i, />\s*(\d+(?:[.,]\d+)?)/] },
  { operator: "<", patterns: [/(?:nhỏ hơn|bé hơn|dưới|less than|under|below)\s*(\d+(?:[.,]\d+)?)/i, /<\s*(\d+(?:[.,]\d+)?)/] },
  { operator: "=", patterns: [/(?:bằng|equal to|equals)\s*(\d+(?:[.,]\d+)?)/i] },
];

const OPERATOR_SUFFIX: { operator: Operator; pattern: RegExp }[] = [
  { operator: ">=", pattern: /(\d+(?:[.,]\d+)?)\s*(?:trở lên|or more)/i },
  { operator: "<=", pattern: /(\d+(?:[.,]\d+)?)\s*(?:trở xuống|or less)/i },
];

// "60-70", "60 – 70", "từ 60 đến 70", "60 to 70", "between 60 and 70"
const RANGE_PATTERNS: RegExp[] = [
  /(?:từ|between)?\s*(\d+(?:[.,]\d+)?)\s*(?:-|–|đến|to|and|tới)\s*(\d+(?:[.,]\d+)?)/i,
];

const CLAUSE_SPLIT = /,|;|\bvà\b|\band\b|&/gi;

function splitClauses(query: string): string[] {
  return query.split(CLAUSE_SPLIT).map((s) => s.trim()).filter(Boolean);
}

function findOperatorValue(q: string): { operator: Operator; value: number } | null {
  for (const group of OPERATOR_PREFIX) {
    for (const re of group.patterns) {
      const m = q.match(re);
      if (m) return { operator: group.operator, value: parseFloat(m[1].replace(",", ".")) };
    }
  }
  for (const { operator, pattern } of OPERATOR_SUFFIX) {
    const m = q.match(pattern);
    if (m) return { operator, value: parseFloat(m[1].replace(",", ".")) };
  }
  return null;
}

function findRange(q: string): { min: number; max: number } | null {
  for (const re of RANGE_PATTERNS) {
    const m = q.match(re);
    if (m) {
      const a = parseFloat(m[1].replace(",", "."));
      const b = parseFloat(m[2].replace(",", "."));
      if (!Number.isNaN(a) && !Number.isNaN(b) && b > a) return { min: a, max: b };
    }
  }
  return null;
}

function detectField(q: string): FieldConfig | null {
  return FIELD_CONFIGS.find((cfg) => cfg.keywords.some((kw) => q.includes(kw))) ?? null;
}

function detectDpCondition(clause: string): string | null {
  const q = clause.toLowerCase().replace(/\s+/g, "");
  const m = q.match(/dps?-?(\d)/);
  return m ? m[1] : null;
}

// jubVessels stores crane/weight/etc. as free text (e.g. "190t@13-15m"); the leading number is the headline rated value.
function extractLeadingNumber(raw: string | number | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw);
  if (/không tìm thấy|không áp dụng/i.test(s)) return null;
  const m = s.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  return parseFloat(m[1].replace(",", "."));
}

function compare(a: number, op: Operator, b: number): boolean {
  switch (op) {
    case ">": return a > b;
    case ">=": return a >= b;
    case "<": return a < b;
    case "<=": return a <= b;
    case "=": return a === b;
  }
}

function normalizeDp(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectTypeCondition(q: string): Condition | null {
  for (const cfg of TYPE_CONFIGS) {
    if (cfg.typeKeywords.some((kw) => q.includes(kw)) || q.includes(cfg.token)) {
      return {
        type: "category",
        kind: "type",
        token: cfg.token,
        labelVi: `loại ${cfg.labelVi}`,
        labelEn: `${cfg.labelEn} type`,
        test: (v) => {
          const vv = v as Vessel;
          const inCat = cfg.categories.includes(String(vv.category));
          const inType = cfg.typeKeywords.some((kw) => String(v.idType).toLowerCase().includes(kw));
          return inCat || inType;
        },
      };
    }
  }
  return null;
}

function detectRegionCondition(q: string): Condition | null {
  for (const cfg of REGION_CONFIGS) {
    if (cfg.triggers.some((tr) => q.includes(tr))) {
      return {
        type: "category",
        kind: "region",
        token: cfg.token,
        labelVi: cfg.labelVi,
        labelEn: cfg.labelEn,
        test: (v) => {
          const hay = regionHaystack(v);
          return cfg.signals.some((s) => hay.includes(s));
        },
      };
    }
  }
  return null;
}

function detectFlagCondition(q: string): Condition | null {
  for (const cfg of FLAG_CONFIGS) {
    if (cfg.match.some((m) => q.includes(m))) {
      return {
        type: "category",
        kind: "flag",
        token: cfg.token,
        labelVi: cfg.labelVi,
        labelEn: cfg.labelEn,
        test: (v) => cfg.match.some((m) => String(v.idFlag).toLowerCase().includes(m)),
      };
    }
  }
  return null;
}

// One clause may carry several independent criteria, e.g. "JUB ở Trung Đông" → [type, region].
function detectClauseConditions(clause: string): Condition[] {
  const q = clause.toLowerCase();
  const out: Condition[] = [];

  const digit = detectDpCondition(clause);
  if (digit) out.push({ type: "dp", digit });

  const fieldCfg = detectField(q);
  if (fieldCfg) {
    const range = findRange(q);
    if (range) {
      out.push({
        type: "range",
        match: { field: fieldCfg.field, fieldLabelVi: fieldCfg.labelVi, fieldLabelEn: fieldCfg.labelEn, unit: fieldCfg.unit, ...range },
      });
    } else {
      const opVal = findOperatorValue(q);
      if (opVal) {
        out.push({
          type: "numeric",
          match: { field: fieldCfg.field, fieldLabelVi: fieldCfg.labelVi, fieldLabelEn: fieldCfg.labelEn, operator: opVal.operator, value: opVal.value, unit: fieldCfg.unit },
        });
      }
    }
  }

  const typeCond = detectTypeCondition(q);
  if (typeCond) out.push(typeCond);

  // Region takes precedence over a bare flag match (region is broader: flag + owner + port).
  const regionCond = detectRegionCondition(q);
  if (regionCond) out.push(regionCond);
  else {
    const flagCond = detectFlagCondition(q);
    if (flagCond) out.push(flagCond);
  }

  return out;
}

export function hasRegionCondition(conditions: Condition[]): boolean {
  return conditions.some((c) => c.type === "category" && c.kind === "region");
}

function applyCondition(vessels: JubVessel[], cond: Condition): JubVessel[] {
  if (cond.type === "dp") {
    return vessels.filter((v) => {
      const norm = normalizeDp(String(v.pwrDpClass));
      return norm.includes(`dps${cond.digit}`) || norm.includes(`dp${cond.digit}`);
    });
  }
  if (cond.type === "category") return vessels.filter(cond.test);
  if (cond.type === "range") {
    const { field, min, max } = cond.match;
    return vessels.filter((v) => {
      const n = extractLeadingNumber(v[field] as string | number | undefined);
      return n !== null && n >= min && n <= max;
    });
  }
  const { field, operator, value } = cond.match;
  return vessels.filter((v) => {
    const n = extractLeadingNumber(v[field] as string | number | undefined);
    return n !== null && compare(n, operator, value);
  });
}

// ---- Sort ----------------------------------------------------------------

const SORT_DESC = /(mạnh nhất|khỏe nhất|lớn nhất|to nhất|cao nhất|nhiều nhất|nặng nhất|nhanh nhất|mới nhất|largest|biggest|strongest|highest|most|newest|fastest)/i;
const SORT_ASC = /(nhỏ nhất|bé nhất|thấp nhất|ít nhất|nhẹ nhất|chậm nhất|cũ nhất|smallest|lowest|least|oldest|slowest)/i;

function detectSort(query: string): SortSpec | null {
  const q = query.toLowerCase();
  const desc = SORT_DESC.test(q);
  const asc = SORT_ASC.test(q);
  if (!desc && !asc) return null;
  let cfg = detectField(q);
  // superlative without an explicit field → sensible defaults
  if (!cfg) {
    if (/mạnh|khỏe|strong|bollard|kéo/i.test(q)) cfg = FIELD_CONFIGS.find((f) => f.field === "bollardPullT")!;
    else if (/lớn|to|big|large/i.test(q)) cfg = FIELD_CONFIGS.find((f) => f.field === "dimLoa")!;
    else if (/nhanh|chậm|speed/i.test(q)) cfg = FIELD_CONFIGS.find((f) => f.field === "speedKn")!;
    else if (/mới|cũ|new|old/i.test(q)) cfg = FIELD_CONFIGS.find((f) => f.field === "idYear")!;
    else return null;
  }
  return { field: cfg.field, labelVi: cfg.labelVi, labelEn: cfg.labelEn, unit: cfg.unit, dir: asc ? "asc" : "desc" };
}

function applySort(vessels: JubVessel[], sort: SortSpec): JubVessel[] {
  const withNum = vessels
    .map((v) => ({ v, n: extractLeadingNumber(v[sort.field] as string | number | undefined) }))
    .filter((x) => x.n !== null) as { v: JubVessel; n: number }[];
  withNum.sort((a, b) => (sort.dir === "asc" ? a.n - b.n : b.n - a.n));
  return withNum.map((x) => x.v);
}

// ---- Labels --------------------------------------------------------------

export function operatorLabel(op: Operator, locale: Locale): string {
  const labels: Record<Operator, Record<Locale, string>> = {
    ">": { vi: "lớn hơn", en: "greater than" },
    ">=": { vi: "từ", en: "at least" },
    "<": { vi: "nhỏ hơn", en: "less than" },
    "<=": { vi: "tối đa", en: "at most" },
    "=": { vi: "bằng", en: "equal to" },
  };
  return labels[op][locale];
}

export function conditionLabel(cond: Condition, locale: Locale): string {
  if (cond.type === "dp") return locale === "vi" ? `cấp DP chứa "DPS-${cond.digit}"` : `DP class containing "DPS-${cond.digit}"`;
  if (cond.type === "category") return locale === "vi" ? cond.labelVi : cond.labelEn;
  if (cond.type === "range") {
    const { match } = cond;
    const label = locale === "vi" ? match.fieldLabelVi : match.fieldLabelEn;
    const unit = match.unit ? ` ${match.unit}` : "";
    return locale === "vi" ? `${label} ${match.min}–${match.max}${unit}` : `${label} ${match.min}–${match.max}${unit}`;
  }
  const { match } = cond;
  const label = locale === "vi" ? match.fieldLabelVi : match.fieldLabelEn;
  const unit = match.unit ? ` ${match.unit}` : "";
  return `${label} ${operatorLabel(match.operator, locale)} ${match.value}${unit}`;
}

export function sortLabel(sort: SortSpec, locale: Locale): string {
  const field = locale === "vi" ? sort.labelVi : sort.labelEn;
  const dir = sort.dir === "desc" ? (locale === "vi" ? "giảm dần" : "descending") : locale === "vi" ? "tăng dần" : "ascending";
  return locale === "vi" ? `sắp xếp theo ${field} (${dir})` : `sorted by ${field} (${dir})`;
}

// ---- Structured query result --------------------------------------------

export type StructuredResult = {
  conditions: Condition[];
  sort: SortSpec | null;
  vessels: JubVessel[];
  /** fraction (0–1) of ALL vessels that have parseable data for the queried numeric fields */
  coverage: number;
  describe: (v: JubVessel) => string;
};

/** Parses clauses into conditions (numeric / range / dp / category), AND-filters, and sorts. */
export function parseStructuredQuery(query: string, vessels: JubVessel[]): StructuredResult | null {
  const clauses = splitClauses(query);
  const conditions: Condition[] = [];
  for (const clause of clauses) {
    for (const cond of detectClauseConditions(clause)) conditions.push(cond);
  }
  const sort = detectSort(query);
  if (conditions.length === 0 && !sort) return null;

  let matched = conditions.reduce((acc, cond) => applyCondition(acc, cond), vessels);

  // Data coverage across numeric/range fields (how many vessels even carry the data).
  const numFields = conditions
    .filter((c): c is Extract<Condition, { type: "numeric" | "range" }> => c.type === "numeric" || c.type === "range")
    .map((c) => c.match.field);
  let coverage = 1;
  if (numFields.length > 0) {
    const covs = numFields.map((f) => vessels.filter((v) => extractLeadingNumber(v[f] as string | number) !== null).length / Math.max(1, vessels.length));
    coverage = Math.min(...covs);
  }

  if (sort) matched = applySort(matched, sort);

  const regionQuery = hasRegionCondition(conditions);
  const describe = (v: JubVessel) => {
    // For region queries, show the geographic basis (flag · owner) instead of type.
    if (regionQuery) {
      const flag = String(v.idFlag ?? "").trim();
      const owner = String(v.idOwner ?? "").trim();
      return [flag, owner].filter((p) => p && !/không tìm thấy|không áp dụng/i.test(p)).join(" · ") || String(v.idType);
    }
    const parts: string[] = [];
    for (const c of conditions) {
      if (c.type === "dp") parts.push(String(v.pwrDpClass));
      else if (c.type === "category") parts.push(String(v.idType));
      else parts.push(String(v[c.match.field]));
    }
    if (sort && parts.length === 0) parts.push(String(v[sort.field]));
    return parts.filter((p) => p && !/không tìm thấy|không áp dụng/i.test(p)).join(" · ") || String(v.idType);
  };

  return { conditions, sort, vessels: matched, coverage, describe };
}

// Backward-compatible name used elsewhere.
export function parseMultiQuery(query: string, vessels: JubVessel[]) {
  const r = parseStructuredQuery(query, vessels);
  if (!r || r.conditions.length === 0) return null;
  return { conditions: r.conditions, vessels: r.vessels };
}

// ---- Confidence ----------------------------------------------------------

export function structuredConfidence(r: StructuredResult): Confidence {
  if (r.vessels.length === 0) {
    return {
      level: "low",
      reasonVi: "Không tàu nào khớp — có thể do dữ liệu trường này còn thiếu ở nhiều tàu.",
      reasonEn: "No vessel matched — the queried field may be missing for many vessels.",
    };
  }
  if (r.coverage < 0.4) {
    return {
      level: "low",
      reasonVi: `Chỉ ~${Math.round(r.coverage * 100)}% tàu có dữ liệu trường này; kết quả có thể sót tàu.`,
      reasonEn: `Only ~${Math.round(r.coverage * 100)}% of vessels carry this field; results may be incomplete.`,
    };
  }
  if (r.coverage < 0.75) {
    return {
      level: "medium",
      reasonVi: `Lọc chính xác theo số, nhưng ~${Math.round((1 - r.coverage) * 100)}% tàu thiếu dữ liệu trường này nên có thể sót.`,
      reasonEn: `Exact numeric filter, but ~${Math.round((1 - r.coverage) * 100)}% of vessels lack this field, so some may be missed.`,
    };
  }
  return {
    level: "high",
    reasonVi: "Lọc chính xác trên trường số/hạng mục có dữ liệu đầy đủ.",
    reasonEn: "Exact filter on well-populated structured fields.",
  };
}

export function regionConfidence(found: number): Confidence {
  if (found === 0) {
    return {
      level: "low",
      reasonVi: "Không tàu nào khớp khu vực theo cờ/chủ tàu. Nhiều tàu treo cờ thuận tiện (Panama, St Vincent…) nên không suy ra được khu vực.",
      reasonEn: "No vessel matched the region by flag/owner. Many carry flags of convenience (Panama, St Vincent…), so region can't be inferred.",
    };
  }
  return {
    level: "low",
    reasonVi: "⚠ Đây KHÔNG phải vị trí AIS thời gian thực — chỉ là khu vực đăng ký/khai thác suy từ cờ + chủ tàu + cảng. Xem vị trí thực tại nút MarineTraffic trên trang tàu.",
    reasonEn: "⚠ NOT a real-time AIS position — only a registry/operating region inferred from flag + owner + port. Check the MarineTraffic button on the vessel page for the live position.",
  };
}

export function keywordConfidence(found: number): Confidence {
  if (found === 0) {
    return { level: "low", reasonVi: "Không khớp từ khóa nào trong dữ liệu tàu.", reasonEn: "No keyword match in the vessel data." };
  }
  return {
    level: "medium",
    reasonVi: "Khớp theo từ khóa văn bản (tên/IMO/chủ tàu/loại) — không phải lọc số chính xác.",
    reasonEn: "Text keyword match (name/IMO/owner/type) — not an exact numeric filter.",
  };
}
