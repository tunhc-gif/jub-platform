#!/usr/bin/env node
// -----------------------------------------------------------------------------
// vessel-photos — tích hợp ảnh tàu vào nền tảng (tự động, tiết kiệm token).
//
// Quét thư mục ảnh (mặc định D:\VESSEL\Vessel) gồm các folder con dạng
// "<IMO>-<TÊN TÀU>" chứa ảnh .webp/.jpg/.png (kết quả của Get-VesselPhotos.ps1),
// copy ảnh vào public/vessel-photos/<IMO>/ và sinh manifest src/data/vesselPhotos.json
// map theo IMO + slug tên tàu. Trang chi tiết tàu tự đọc manifest để hiện ô ảnh.
//
// Dùng:
//   node scripts/vessel-photos.mjs                 # quét D:\VESSEL\Vessel
//   node scripts/vessel-photos.mjs "D:\path\folder" # 1 folder tàu hoặc thư mục gốc
//   node scripts/vessel-photos.mjs --max 6          # tối đa 6 ảnh/tàu
// -----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public", "vessel-photos");
const MANIFEST = path.join(ROOT, "src", "data", "vesselPhotos.json");
const IMG_RE = /\.(webp|jpe?g|png)$/i;

const args = process.argv.slice(2);
const maxFlagIdx = args.indexOf("--max");
const MAX = maxFlagIdx >= 0 ? parseInt(args[maxFlagIdx + 1], 10) || 0 : 0;
const positional = args.filter((a, i) => !a.startsWith("--") && i !== maxFlagIdx + 1);
const SOURCE = positional[0] || "D:/VESSEL/Vessel";

function slug(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Một "folder tàu" = tên dạng "<IMO>-<TÊN>" (IMO = số đầu). Trả {imo,name} hoặc null.
function parseVesselFolder(dirname) {
  const m = dirname.match(/^(\d{6,7})[-_ ]+(.+)$/);
  if (!m) return null;
  return { imo: m[1], name: m[2].trim() };
}

// Thu thập danh sách folder tàu: nếu SOURCE tự là folder tàu thì chỉ nó; nếu là
// thư mục gốc thì mọi folder con hợp lệ.
function collectVesselDirs(src) {
  const base = path.basename(src.replace(/[\\/]+$/, ""));
  const selfParsed = parseVesselFolder(base);
  if (selfParsed && fs.existsSync(src) && fs.statSync(src).isDirectory()) {
    // kiểm tra có ảnh trực tiếp không → coi là folder tàu
    const hasImg = fs.readdirSync(src).some((f) => IMG_RE.test(f));
    if (hasImg) return [{ dir: src, ...selfParsed }];
  }
  const out = [];
  if (!fs.existsSync(src)) return out;
  for (const entry of fs.readdirSync(src)) {
    const p = path.join(src, entry);
    if (!fs.statSync(p).isDirectory()) continue;
    const parsed = parseVesselFolder(entry);
    if (!parsed) continue;
    if (!fs.readdirSync(p).some((f) => IMG_RE.test(f))) continue;
    out.push({ dir: p, ...parsed });
  }
  return out;
}

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch { return {}; }
}

const dirs = collectVesselDirs(SOURCE);
if (!dirs.length) {
  console.error("Không tìm thấy folder tàu (dạng '<IMO>-<TÊN>' có ảnh) trong:", SOURCE);
  process.exit(1);
}
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
const manifest = loadManifest();
let vesselCount = 0, photoCount = 0;

for (const { dir, imo, name } of dirs) {
  let files = fs.readdirSync(dir).filter((f) => IMG_RE.test(f)).sort();
  if (MAX > 0) files = files.slice(0, MAX);
  if (!files.length) continue;
  const destDir = path.join(PUBLIC_DIR, imo);
  fs.mkdirSync(destDir, { recursive: true });
  const urls = [];
  for (const f of files) {
    fs.copyFileSync(path.join(dir, f), path.join(destDir, f));
    urls.push(`/vessel-photos/${imo}/${encodeURIComponent(f)}`);
    photoCount++;
  }
  // key theo IMO và slug tên (trang tra cả hai)
  manifest[imo] = urls;
  manifest[slug(name)] = urls;
  vesselCount++;
  console.log(`${imo}  ${name.padEnd(28)} ${files.length} ảnh`);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n✔ ${vesselCount} tàu, ${photoCount} ảnh → public/vessel-photos/`);
console.log(`✔ manifest: src/data/vesselPhotos.json (${Object.keys(manifest).length} keys)`);
