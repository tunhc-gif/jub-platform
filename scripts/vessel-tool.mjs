#!/usr/bin/env node
// -----------------------------------------------------------------------------
// vessel-tool — tự động hoá quy trình tích hợp tàu vào nền tảng.
//
// Phần cơ học (dedup, phân loại category, merge vào đúng file dữ liệu, regenerate
// vessel-master.csv, typecheck) được tool lo hết. Phần cần LLM (trích JSON từ PDF)
// vẫn do Claude làm rồi đưa file JSON cho tool.
//
// Lệnh:
//   node scripts/vessel-tool.mjs add <file.json | dir | ...>   Thêm tàu (1 object,
//        1 mảng, nhiều file, hoặc cả thư mục .json). Tự dedup + phân loại + merge
//        + rebuild CSV + typecheck.
//   node scripts/vessel-tool.mjs csv                            Chỉ regenerate CSV.
//   node scripts/vessel-tool.mjs check <imo|tên>                Kiểm tra trùng.
//   node scripts/vessel-tool.mjs stats                          Đếm tàu theo nhóm.
//   node scripts/vessel-tool.mjs template [category]            In JSON mẫu đủ field.
//   node scripts/vessel-tool.mjs extract <file.pdf>             pdftotext -layout.
//   node scripts/vessel-tool.mjs imo <file.xlsx|csv>            Điền idImo còn thiếu
//        theo cột (displayName, idImo) — chỉ ghi vào tàu đang thiếu IMO.
//
// Cờ cho `add`:  --dry (không ghi, chỉ báo)   --no-tsc (bỏ typecheck)
//               --force-cat=<slug> (ép nhóm)
// -----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "src", "data");
const CSV_OUT = "D:/VESSEL/vessel-master.csv";

const NF = "Không tìm thấy";
const NA = "Không áp dụng";

// Nhóm category slug -> file dữ liệu (không .json). Khớp vessels.ts + vesselTypes.ts.
const CATEGORY_FILE = {
  hlv: "hlvVessels",
  jub: "jubExtra", // tàu mới luôn vào jubExtra (jubVessels là bộ gốc)
  ocv: "ocvVessels",
  dsv: "dsvVessels",
  "supply-boat": "supplyBoatVessels",
  workboat: "workBoatVessels",
  crewboat: "crewboatVessels",
  floatel: "floatelVessels",
};
// Mọi file chứa tàu (để dedup + rebuild CSV), kèm category tag.
const ALL_FILES = [
  ["hlvVessels", "hlv"],
  ["jubVessels", "jub"],
  ["jubExtra", "jub"],
  ["ocvVessels", "ocv"],
  ["dsvVessels", "dsv"],
  ["supplyBoatVessels", "supply-boat"],
  ["workBoatVessels", "workboat"],
  ["crewboatVessels", "crewboat"],
  ["floatelVessels", "floatel"],
];

// Thứ tự field chuẩn (JubVessel schema) — cũng dùng cho template.
const KEYS = [
  "id","displayName","nameNote","idName","idType","idOwner","idFlag","idPort","idClassSociety","idNotation",
  "idImo","idCallsign","idMmsi","idAbsNo","idRegNo","idDesigner","idBuilder","idHullNo","idYear","idLocation",
  "dimLbp","dimLoa","dimWidth","dimDepth","dimLegsQty","dimLegType","dimLegLength","dimLegTransverseCenters",
  "dimLegFwdAftDist","dimSpudcanHeight","dimSpudcanArea","wtLightshipExLegs","wtLegsSpudcans","wtLightshipTotal",
  "wtDisplacementLoaded","wtDraftLoaded","accPobMax","accDimsLwh","heliDiameter","heliType","heliMaxTow",
  "craneMainQty","craneMainSwl","craneMainWindLimit","craneAuxQty","craneAuxSwl","craneAuxWindLimit",
  "jackUnitsPerLeg","jackUnitsTotal","jackNormalCapUnit","jackPreloadCapUnit","jackMaxHoldingUnit",
  "jackStormHoldingUnit","jackSpeed","jackAlarmAngle","pwrMainGenDesc","pwrMainGenUnitEkw","pwrMainGenTotalEkw",
  "pwrEmergGenDesc","pwrEmergGenEkw","pwrBowThruster","pwrAftThruster","pwrDpClass","tankFoTotalM3","tankFwTotalM3",
  "tankBallastTotalM3","tankBrineTotalM3","tankBufferTotalM3","envStormWind","envStormWave","envStormPeriod",
  "envStormDepth","envStormCurrent","envStormAirgap","envNormalWind","envNormalWave","envNormalPeriod",
  "envNormalDepth","envNormalAirgap","opsFieldmoveWindKn","opsFieldmoveWaveM","opsFieldmoveBeaufort",
  "opsJackingWind","opsJackingWave","opsCraneWind","opsAirTemp","opsSeaTemp","srcDoc","srcDate",
];
// Field jack-up-only -> non-jub sẽ để "Không áp dụng" nếu thiếu.
const JACK_KEYS = new Set([
  "dimLegsQty","dimLegType","dimLegLength","dimLegTransverseCenters","dimLegFwdAftDist","dimSpudcanHeight",
  "dimSpudcanArea","wtLegsSpudcans","jackUnitsPerLeg","jackUnitsTotal","jackNormalCapUnit","jackPreloadCapUnit",
  "jackMaxHoldingUnit","jackStormHoldingUnit","jackSpeed","jackAlarmAngle","envStormAirgap","envNormalAirgap",
  "opsJackingWind","opsJackingWave",
]);
const BONUS_KEYS = ["cargoDeckArea", "speedKn", "bollardPullT", "dwt"];
const CSV_COLS = ["category", ...KEYS, "nameNote", "cargoDeckArea", "speedKn", "bollardPullT", "dwt"]
  // nameNote already in KEYS? no — keep unique order matching earlier CSV layout.
  .filter((c, i, a) => a.indexOf(c) === i);

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name + ".json"), "utf8"));
}
function saveJson(name, arr) {
  fs.writeFileSync(path.join(DATA, name + ".json"), JSON.stringify(arr, null, 2) + "\n");
}
function slug(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function validImo(s) {
  return /^\d{7}$/.test(String(s || "").trim());
}

// Phân loại category từ idType (nếu không có category/force).
function detectCategory(idType) {
  const t = String(idType || "").toLowerCase();
  if (/jack.?up|self.?elevat|liftboat|liftboat/.test(t)) return "jub";
  if (/heavy.?lift|crane vessel|crane barge|derrick/.test(t)) return "hlv";
  if (/barge/.test(t)) return "floatel";
  // Subsea support (rộng): thi công/lắp đặt ngầm, ROV/IMR, DSV, well intervention, MPSV, SOV
  if (/subsea|\bdsv\b|dscv|diving|\bdive\b|\brov\b|\bimr\b|well intervention|offshore construction|construction vessel|light construction|\bmpsv\b|multi.?purpose support|\bsov\b|\bocv\b/.test(t)) return "dsv";
  if (/ahts|anchor handling|\baht\b|multi.?purpose|dp2 rov/.test(t)) return "ocv";
  if (/crew.?boat/.test(t)) return "crewboat";
  if (/\bpsv\b|platform supply/.test(t)) return "supply-boat";
  return "workboat";
}

// Chuẩn hoá 1 record đến: đảm bảo đủ key, xác định category, bỏ field lạ.
function normalize(v, forceCat) {
  const out = {};
  // category
  let cat = forceCat || v.category || (v.categoryGuess && CATEGORY_FILE[v.categoryGuess] ? v.categoryGuess : null);
  if (!cat) cat = detectCategory(v.idType);
  if (!CATEGORY_FILE[cat]) cat = detectCategory(v.idType);
  // id
  const id = v.id ? slug(v.id) : slug(v.displayName || v.idName);
  out.id = id;
  out.displayName = v.displayName || v.idName || id.toUpperCase();
  for (const k of KEYS) {
    if (k === "id" || k === "displayName") continue;
    if (v[k] !== undefined && v[k] !== null && String(v[k]).trim() !== "") out[k] = String(v[k]);
    else out[k] = cat !== "jub" && JACK_KEYS.has(k) ? NA : NF;
  }
  for (const k of BONUS_KEYS) {
    if (v[k] !== undefined && v[k] !== null && String(v[k]).trim() !== "") out[k] = String(v[k]);
  }
  return { record: out, category: cat };
}

function collectIncoming(paths) {
  const items = [];
  for (const p of paths) {
    const st = fs.existsSync(p) ? fs.statSync(p) : null;
    if (!st) { console.error("Bỏ qua (không tồn tại):", p); continue; }
    const files = st.isDirectory()
      ? fs.readdirSync(p).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => path.join(p, f))
      : [p];
    for (const f of files) {
      const parsed = JSON.parse(fs.readFileSync(f, "utf8"));
      for (const obj of Array.isArray(parsed) ? parsed : [parsed]) items.push(obj);
    }
  }
  return items;
}

function csvEsc(v) {
  if (v == null) v = "";
  v = String(v);
  return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}
function rebuildCsv() {
  const rows = [];
  for (const [file, cat] of ALL_FILES) {
    for (const v of loadJson(file)) {
      const o = { ...v, category: cat };
      rows.push(CSV_COLS.map((c) => csvEsc(o[c])).join(","));
    }
  }
  const csv = "\uFEFF" + CSV_COLS.join(",") + "\r\n" + rows.join("\r\n") + "\r\n";
  let target = CSV_OUT;
  try {
    fs.writeFileSync(CSV_OUT, csv);
  } catch (e) {
    target = CSV_OUT.replace(/\.csv$/, "-" + new Date().toISOString().slice(0, 10) + ".csv");
    fs.writeFileSync(target, csv);
    console.warn("⚠ vessel-master.csv bị khoá → ghi ra", target);
  }
  return { rows: rows.length, target };
}

function existingIndex() {
  const ids = new Set(), imos = new Set();
  for (const [file] of ALL_FILES) {
    for (const v of loadJson(file)) {
      ids.add(v.id);
      const im = String(v.idImo || "").trim();
      if (validImo(im)) imos.add(im);
    }
  }
  return { ids, imos };
}

function cmdAdd(args) {
  const flags = args.filter((a) => a.startsWith("--"));
  const paths = args.filter((a) => !a.startsWith("--"));
  const dry = flags.includes("--dry");
  const noTsc = flags.includes("--no-tsc");
  const forceCat = (flags.find((f) => f.startsWith("--force-cat=")) || "").split("=")[1];
  if (!paths.length) { console.error("Cần đường dẫn file/thư mục JSON."); process.exit(1); }

  const incoming = collectIncoming(paths);
  const { ids, imos } = existingIndex();
  const buckets = {}; // category -> [records]
  const report = [];
  let added = 0, skipped = 0;

  for (const raw of incoming) {
    const { record, category } = normalize(raw, forceCat);
    const im = String(record.idImo || "").trim();
    if (ids.has(record.id) || (validImo(im) && imos.has(im))) {
      report.push(`SKIP trùng: ${record.displayName} (${im || "no-imo"})`);
      skipped++;
      continue;
    }
    (buckets[category] ??= []).push(record);
    ids.add(record.id);
    if (validImo(im)) imos.add(im);
    report.push(`${category.padEnd(11)} ${record.displayName}  (IMO ${im || "-"})`);
    added++;
  }

  console.log(report.sort().join("\n"));
  console.log(`\nSẽ thêm: ${added} | Bỏ qua trùng: ${skipped}`);
  if (dry) { console.log("(--dry: không ghi)"); return; }
  if (!added) return;

  for (const [cat, recs] of Object.entries(buckets)) {
    const file = CATEGORY_FILE[cat];
    if (!file) { console.error(`⚠ Nhóm "${cat}" chưa có file dữ liệu — bỏ:`, recs.map((r) => r.displayName).join(", ")); continue; }
    const arr = loadJson(file);
    arr.push(...recs);
    saveJson(file, arr);
  }
  const csv = rebuildCsv();
  console.log(`\n✔ Đã merge. vessel-master.csv: ${csv.rows} dòng.`);
  if (!noTsc) {
    try {
      execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "pipe" });
      console.log("✔ TypeScript sạch.");
    } catch (e) {
      console.error("✗ TypeScript LỖI:\n" + (e.stdout || e.stderr || "").toString().slice(0, 2000));
      process.exit(2);
    }
  }
}

function cmdCheck(args) {
  const q = args.join(" ").toLowerCase().trim();
  const hits = [];
  for (const [file, cat] of ALL_FILES) {
    for (const v of loadJson(file)) {
      if (String(v.displayName).toLowerCase().includes(q) || String(v.idImo).includes(q) || v.id.includes(slug(q)))
        hits.push(`${cat.padEnd(11)} ${v.displayName}  IMO=${v.idImo}  id=${v.id}`);
    }
  }
  console.log(hits.length ? hits.join("\n") : "Không tìm thấy — có thể là tàu MỚI.");
}

function cmdStats() {
  let total = 0, withImo = 0;
  const per = {};
  for (const [file, cat] of ALL_FILES) {
    const d = loadJson(file);
    per[cat] = (per[cat] || 0) + d.length;
    total += d.length;
    withImo += d.filter((v) => validImo(v.idImo)).length;
  }
  for (const [c, n] of Object.entries(per)) console.log(`${c.padEnd(12)} ${n}`);
  console.log(`\nTổng: ${total} | Có IMO hợp lệ: ${withImo} | Thiếu IMO: ${total - withImo}`);
}

function cmdTemplate(args) {
  const cat = args[0] || "ocv";
  const t = {};
  t.id = "";
  t.displayName = "";
  for (const k of KEYS) {
    if (k === "id" || k === "displayName") continue;
    t[k] = cat !== "jub" && JACK_KEYS.has(k) ? NA : NF;
  }
  for (const k of BONUS_KEYS) t[k] = NF;
  t.categoryGuess = cat;
  console.log(JSON.stringify(t, null, 2));
}

function cmdExtract(args) {
  const pdf = args[0];
  if (!pdf) { console.error("Cần đường dẫn PDF."); process.exit(1); }
  try {
    const out = execSync(`pdftotext -layout "${pdf}" -`, { maxBuffer: 64 * 1024 * 1024 }).toString();
    process.stdout.write(out);
  } catch (e) {
    console.error("pdftotext lỗi:", e.message);
    process.exit(1);
  }
}

// Điền idImo còn thiếu từ file mapping (.xlsx OOXML hoặc .csv) theo displayName.
function cmdImo(args) {
  const file = args[0];
  if (!file || !fs.existsSync(file)) { console.error("Cần file .xlsx/.csv mapping (displayName, idImo)."); process.exit(1); }
  const map = {};
  if (/\.xlsx$/i.test(file)) {
    // giải nén OOXML tối giản bằng execSync unzip (Git Bash có sẵn)
    const tmp = path.join(ROOT, ".imotmp");
    fs.rmSync(tmp, { recursive: true, force: true });
    execSync(`unzip -o "${file}" -d "${tmp}"`, { stdio: "pipe" });
    const ss = fs.existsSync(path.join(tmp, "xl/sharedStrings.xml"))
      ? fs.readFileSync(path.join(tmp, "xl/sharedStrings.xml"), "utf8") : "";
    const strings = [];
    let m; const re = /<(?:x:)?si>([\s\S]*?)<\/(?:x:)?si>/g;
    while ((m = re.exec(ss))) strings.push(m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
    const sheets = fs.readdirSync(path.join(tmp, "xl/worksheets")).filter((f) => f.endsWith(".xml"));
    for (const sh of sheets) {
      const x = fs.readFileSync(path.join(tmp, "xl/worksheets", sh), "utf8");
      let r; const rre = /<(?:x:)?row[^>]*>([\s\S]*?)<\/(?:x:)?row>/g;
      while ((r = rre.exec(x))) {
        const cells = {}; let c;
        const cre = /<(?:x:)?c r="([A-Z]+)\d+"(?:[^>]*?t="([^"]*)")?[^>]*?>\s*(?:<(?:x:)?v>([^<]*)<\/(?:x:)?v>)?/g;
        while ((c = cre.exec(r[1]))) { if (c[3] !== undefined) cells[c[1]] = c[2] === "s" ? strings[+c[3]] : c[3]; }
        // tìm cột tên (chứa chữ) và cột IMO (7 số) trong mỗi hàng
        const vals = Object.values(cells);
        const name = vals.find((s) => /[A-Za-z]{3,}/.test(String(s)) && !/^\d+$/.test(String(s)));
        const imo = vals.find((s) => validImo(s));
        if (name && imo) map[String(name).trim().toUpperCase()] = String(imo).trim();
      }
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  } else {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const ln of lines) {
      const cells = ln.split(",");
      const name = cells.find((s) => /[A-Za-z]{3,}/.test(s) && !/^\d+$/.test(s.trim()));
      const imo = cells.find((s) => validImo(s.trim()));
      if (name && imo) map[name.trim().toUpperCase()] = imo.trim();
    }
  }
  let filled = 0;
  for (const [file2] of ALL_FILES) {
    const d = loadJson(file2); let touched = false;
    for (const v of d) {
      const imo = map[String(v.displayName).toUpperCase()];
      if (imo && !validImo(v.idImo)) { v.idImo = imo; filled++; touched = true; console.log("FILL", v.displayName, "->", imo); }
    }
    if (touched) saveJson(file2, d);
  }
  console.log(`\nĐã điền ${filled} IMO. (${Object.keys(map).length} mapping trong file)`);
  if (filled) { const csv = rebuildCsv(); console.log(`vessel-master.csv: ${csv.rows} dòng.`); }
}

// -------- dispatch --------
const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "add": cmdAdd(rest); break;
  case "csv": { const r = rebuildCsv(); console.log(`vessel-master.csv: ${r.rows} dòng → ${r.target}`); break; }
  case "check": cmdCheck(rest); break;
  case "stats": cmdStats(); break;
  case "template": cmdTemplate(rest); break;
  case "extract": cmdExtract(rest); break;
  case "imo": cmdImo(rest); break;
  default:
    console.log(`vessel-tool — tự động hoá tích hợp tàu.

  node scripts/vessel-tool.mjs add <file.json|dir> [--dry] [--no-tsc] [--force-cat=ocv]
  node scripts/vessel-tool.mjs csv
  node scripts/vessel-tool.mjs check <imo|tên>
  node scripts/vessel-tool.mjs stats
  node scripts/vessel-tool.mjs template [category]
  node scripts/vessel-tool.mjs extract <file.pdf>
  node scripts/vessel-tool.mjs imo <file.xlsx|csv>`);
}
