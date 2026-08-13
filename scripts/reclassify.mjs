#!/usr/bin/env node
// -----------------------------------------------------------------------------
// reclassify — phân loại lại tàu theo bảng tiêu chí 11 nhóm (HLV, JUB, OCV/CSV,
// DSV, DLB, Floatover, Floatel, AHTS, Workboat, Supply/PSV, Crewboat).
//
// Bộ luật bám cột "Thông số nhận diện quyết định" của bảng:
//   - JUB      : có chân tự nâng (legs) / jack-up / liftboat / self-elevating
//   - HLV      : heavy lift / crane vessel / sheerleg  hoặc cẩu >= 500 t
//   - DLB      : derrick / pipelay / lay barge / stinger / firing line
//   - Floatover: floatover / float-over
//   - DSV      : lặn bão hòa / diving / dive support / saturation / bell
//   - Floatel  : accommodation / flotel  hoặc POB >= 200 (giường)
//   - OCV/CSV  : construction / subsea / ROV / moonpool / IMR / MPSV / W2W /
//                cable lay   hoặc (cẩu AHC >= 100 t & DP2/DP3 & boong >= 700 m2)
//   - Crewboat : crew boat / FCB / fast crew / passenger  hoặc (tốc độ >= 20 kn & LOA <= 55 m)
//   - AHTS     : anchor handling / AHTS  hoặc bollard pull >= 40 t
//   - Supply   : PSV / platform supply / supply  hoặc có két brine/mud  hoặc
//                (DWT & LOA 50–110 m & boong)
//   - Workboat : tug / utility / standby / multi-purpose nhỏ (LOA <= 50 m)
//   - else     : GIỮ NGUYÊN nhóm hiện tại (sà lan hàng, tàu thiếu dữ liệu…)
//
// Dùng:
//   node scripts/reclassify.mjs            # đề xuất (không ghi)
//   node scripts/reclassify.mjs --apply    # ghi lại các file JSON theo nhóm mới
// -----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, "..", "src", "data");
const APPLY = process.argv.includes("--apply");

// slug nhóm -> tên file JSON
const FILES = {
  hlv: "hlvVessels.json",
  jub: "jubExtra.json", // jub gốc (jubVessels.json) không đụng; tàu jub mới rơi vào jubExtra
  ocv: "ocvVessels.json",
  dsv: "dsvVessels.json",
  ahts: "ahtsVessels.json",
  "supply-boat": "supplyBoatVessels.json",
  workboat: "workBoatVessels.json",
  crewboat: "crewboatVessels.json",
  floatel: "floatelVessels.json",
  dlb: "dlbVessels.json",
  "floatover-barge": "floatoverBargeVessels.json",
};
// jubVessels.json là bộ JUB gốc — đọc để giữ nguyên, không phân loại lại.
const JUB_BASE = "jubVessels.json";

const num = (s) => {
  const m = String(s ?? "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};
// Trọng tải cẩu (tấn): chỉ lấy số ĐỨNG TRƯỚC đơn vị t/ton/MT (bỏ qua số model
// như "SCM 3150", "BOS 2600"). Chuẩn hoá dấu ngàn "5.000"/"5,000" → 5000.
const craneT = (s) => {
  const str = String(s ?? "");
  const re = /(\d[\d.,]*)\s*(te|mt|tonnes?|tons?|t)\b/gi;
  let m, max = null;
  while ((m = re.exec(str))) {
    let raw = m[1], val;
    if (/^\d{1,3}([.,]\d{3})+$/.test(raw)) val = parseFloat(raw.replace(/[.,]/g, "")); // dấu ngàn
    else val = parseFloat(raw.replace(/,/g, ""));
    if (!isNaN(val) && (max === null || val > max)) max = val;
  }
  return max;
};
const hay = (v) =>
  [v.idType, v.idName, v.idNotation, v.idDesigner, v.displayName, v.nameNote]
    .map((x) => String(x ?? "").toLowerCase())
    .join(" | ");

function classify(v) {
  const t = hay(v);
  const loa = num(v.dimLoa);
  const speed = num(v.speedKn);
  const deck = num(v.cargoDeckArea);
  const crane = craneT(v.craneMainSwl);
  const pob = num(v.accPobMax);
  const bp = num(v.bollardPullT);
  const dp = String(v.pwrDpClass ?? "").toLowerCase();
  const hasDp23 = /dp\s*[- ]?\s*(2|3|ii|iii)|dynpos|autr|dps.?[23]/.test(dp);
  const legs = num(v.dimLegsQty);

  const ahtsText = /anchor handling|\bahts\b|\baht\b|\bahs\b|anchor handler/.test(t);
  const supplyText = /\bpsv\b|platform supply|supply vessel|supply boat/.test(t);
  const jackText = /jack.?up|lift ?boat|liftboat|self.?elevat/.test(t);
  const accomText = /accommodation|accomodation|flotel|floatel/.test(t);
  const hlvText = /heavy ?lift|\bhlv\b|crane vessel|crane barge|sheer ?leg|sheerleg|floating crane|revolving crane|semi.?submersible crane/.test(t);
  const ocvText = /construction|\bcsv\b|\bocv\b|subsea|multi.?purpose support|multi.?role|\bmpsv\b|\bmsv\b|rov support|rov design|dp2 rov|\bimr\b|well intervention|inspection.*maintenance|light construction|walk.?to.?work|\bw2w\b|cable ?lay|moonpool|dive support/.test(t);
  const diveText = /saturation|diving|dive support|\bdsv\b|\bdive\b|dive spread|dive bell/.test(t);
  const hasBrineMud = num(v.tankBrineTotalM3) || /mud|brine|drill ?water/.test(t);

  // 0. Họ Telford: sà lan lưu trú + thi công DP3 (cẩu AHC ~400t) — gom về OCV
  //    cho nhất quán cả dòng (Telford 25/28/31/33/34).
  if (/\btelford\s*\d/.test(t)) return "ocv";
  // 1. JUB — chân tự nâng (không tính tàu khai báo là AHTS/Supply)
  if (((legs && legs >= 3) || num(v.jackUnitsTotal) || jackText) && !ahtsText && !supplyText)
    return "jub";
  // 2. Floatel ưu tiên khi là nhà nổi lưu trú & cẩu nhỏ (<300 t)
  if (accomText && (crane === null || crane < 300)) return "floatel";
  // 3. DLB — derrick / pipelay (trước HLV vì tàu derrick-lay cũng mang cẩu lớn)
  if (/derrick|pipe ?lay|lay ?barge|\bdlb\b|reel ?lay|s-?lay|j-?lay|stinger|firing line/.test(t))
    return "dlb";
  // 4. HLV — theo loại khai báo (heavy lift / crane vessel / crane barge…)
  if (hlvText) return "hlv";
  // 5. Floatover
  if (/float ?over|float-over/.test(t)) return "floatover-barge";
  // 6. DSV — lặn bão hòa / dive support
  if (diveText) return "dsv";
  // 7. OCV/CSV — construction / subsea / ROV / MPSV…
  if (ocvText) return "ocv";
  if (crane && crane >= 100 && hasDp23 && deck && deck >= 700) return "ocv";
  // 7b. HLV dự phòng: cẩu >= 500 t mà không rõ loại
  if (crane && crane >= 500) return "hlv";
  // 8. Floatel còn lại (lưu trú / POB >= 200)
  if (accomText || (pob && pob >= 200)) return "floatel";
  // 9. Crewboat/FCB
  if (/crew ?boat|\bfcb\b|fast crew|fast (supply|support)|passenger|personnel carrier/.test(t))
    return "crewboat";
  if (speed && speed >= 20 && loa && loa <= 55) return "crewboat";
  // 10. AHTS
  if (ahtsText) return "ahts";
  if (bp && bp >= 40) return "ahts";
  // 11. Supply/PSV
  if (supplyText || /\bosv\b/.test(t)) return "supply-boat";
  if (hasBrineMud) return "supply-boat";
  if (num(v.dwt) && loa && loa >= 50 && loa <= 110 && deck) return "supply-boat";
  // 12. Workboat
  if (/\btug\b|utility|standby|multi.?purpose|work ?boat|line ?handling|mooring/.test(t))
    return "workboat";
  if (loa && loa <= 50) return "workboat";
  // 13. giữ nguyên
  return null;
}

// ---- đọc toàn bộ tàu (kèm nhóm hiện tại) ----
const current = {}; // file -> array
const vessels = []; // {v, fromSlug}
const slugByFile = Object.fromEntries(Object.entries(FILES).map(([s, f]) => [f, s]));
for (const [slug, file] of Object.entries(FILES)) {
  const p = path.join(DATA, file);
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  current[file] = arr;
  for (const v of arr) vessels.push({ v, fromSlug: slug });
}
// jub gốc: giữ nguyên, không xét
const jubBase = JSON.parse(fs.readFileSync(path.join(DATA, JUB_BASE), "utf8"));

// ---- phân loại ----
const moves = [];
const matrix = {}; // from -> to -> count
for (const rec of vessels) {
  const to = classify(rec.v) || rec.fromSlug;
  rec.toSlug = to;
  matrix[rec.fromSlug] = matrix[rec.fromSlug] || {};
  matrix[rec.fromSlug][to] = (matrix[rec.fromSlug][to] || 0) + 1;
  if (to !== rec.fromSlug) moves.push({ name: rec.v.displayName, from: rec.fromSlug, to });
}

// ---- liệt kê thành phần 1 nhóm sau khi xếp lại: --list <slug> ----
const listIdx = process.argv.indexOf("--list");
if (listIdx >= 0) {
  const want = process.argv[listIdx + 1];
  const rows = vessels.filter((r) => r.toSlug === want);
  console.log(`=== ${rows.length} tàu trong nhóm "${want}" sau khi xếp lại ===`);
  for (const r of rows.sort((a, b) => (a.v.displayName > b.v.displayName ? 1 : -1))) {
    const v = r.v;
    console.log(
      (v.displayName || "?").padEnd(20) +
        " | crane=" + craneT(v.craneMainSwl) +
        " | BP=" + (num(v.bollardPullT) ?? "-") +
        " | " + String(v.idType || "").slice(0, 46)
    );
  }
  process.exit(0);
}

// ---- báo cáo ----
const SLUGS = ["hlv", "jub", "ocv", "dsv", "ahts", "supply-boat", "workboat", "crewboat", "floatel", "dlb", "floatover-barge"];
console.log("=== TỔNG SỐ TÀU MỖI NHÓM: HIỆN TẠI → SAU KHI XẾP LẠI ===");
const before = {}, after = {};
for (const [slug] of Object.entries(FILES)) before[slug] = current[FILES[slug]].length;
for (const rec of vessels) after[rec.toSlug] = (after[rec.toSlug] || 0) + 1;
for (const s of SLUGS) {
  const b = before[s] || 0, a = after[s] || 0;
  if (b || a) console.log(`  ${s.padEnd(16)} ${String(b).padStart(3)} → ${String(a).padStart(3)}   ${a - b >= 0 ? "+" : ""}${a - b}`);
}
console.log(`\n=== SỐ TÀU DỊCH CHUYỂN: ${moves.length} ===`);
const byTransition = {};
for (const m of moves) {
  const k = `${m.from} → ${m.to}`;
  (byTransition[k] = byTransition[k] || []).push(m.name);
}
for (const k of Object.keys(byTransition).sort((a, b) => byTransition[b].length - byTransition[a].length)) {
  console.log(`\n[${byTransition[k].length}] ${k}`);
  console.log("   " + byTransition[k].sort().join(", "));
}

// ---- ghi ----
if (APPLY) {
  const out = {};
  for (const slug of Object.keys(FILES)) out[slug] = [];
  for (const rec of vessels) out[rec.toSlug].push(rec.v);
  for (const [slug, file] of Object.entries(FILES)) {
    fs.writeFileSync(path.join(DATA, file), JSON.stringify(out[slug], null, 2) + "\n");
  }
  console.log(`\n✔ Đã ghi lại ${Object.keys(FILES).length} file JSON theo nhóm mới (jubVessels.json gốc giữ nguyên ${jubBase.length} tàu).`);
} else {
  console.log("\n(đề xuất — chưa ghi. Chạy lại với --apply để ghi.)");
}
