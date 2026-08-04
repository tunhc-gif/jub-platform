# vessel-tool — tự động hoá tích hợp tàu

CLI lo toàn bộ phần cơ học của quy trình thêm tàu, để tiết kiệm token. Claude chỉ
cần làm phần trí tuệ (đọc PDF → trích JSON), rồi giao file JSON cho tool.

## Quy trình mới (mỗi khi thêm tàu)

1. **Claude** đọc spec (PDF/xlsx…) → viết record JSON đúng schema (dùng
   `node scripts/vessel-tool.mjs template <category>` làm khung nếu cần).
2. Lưu record vào 1 file `.json` (1 object, hoặc mảng nhiều tàu).
3. Chạy:
   ```bash
   node scripts/vessel-tool.mjs add path/to/new-vessels.json
   ```
   Tool tự: **dedup** (theo id + IMO) → **phân loại category** (từ `category`,
   `categoryGuess`, hoặc suy từ `idType`) → **merge** vào đúng file dữ liệu →
   **regenerate** `D:\VESSEL\vessel-master.csv` → **typecheck** (`tsc --noEmit`).
4. Báo cáo: tàu nào thêm vào nhóm nào, tàu nào trùng bị bỏ.
5. Người dùng **import lại `vessel-master.csv`** vào Google Sheet để lên live.

## Lệnh

| Lệnh | Việc |
|---|---|
| `add <file.json\|dir> [--dry] [--no-tsc] [--force-cat=ocv]` | Thêm tàu (object/mảng/thư mục). Tự dedup + phân loại + merge + CSV + tsc. |
| `csv` | Chỉ regenerate `vessel-master.csv`. |
| `check <imo\|tên>` | Kiểm tra tàu đã có chưa (dedup thủ công). |
| `stats` | Đếm tàu theo nhóm + số có/thiếu IMO. |
| `template [category]` | In JSON mẫu đủ field (mọi field = "Không tìm thấy"/"Không áp dụng"). |
| `extract <file.pdf>` | `pdftotext -layout` — dump text PDF để Claude đọc. |
| `imo <file.xlsx\|csv>` | Điền `idImo` còn thiếu theo (displayName, IMO). Chỉ ghi vào tàu đang thiếu. |

## Phân loại category tự động (từ idType)

`jack-up/self-elevating/liftboat → jub` · `heavy-lift/crane vessel/derrick → hlv` ·
`barge → floatel` · `AHTS/AHT/MPSV/subsea/construction/OCV → ocv` ·
`crewboat → crewboat` · `PSV/platform supply → supply-boat` · còn lại → `workboat`.
Ép nhóm bằng `--force-cat=<slug>`. Field jack-up của tàu non-jub tự để "Không áp dụng".

## Nhóm ↔ file dữ liệu

`hlv→hlvVessels` · `jub→jubExtra` (tàu mới; jubVessels là bộ gốc) · `ocv→ocvVessels` ·
`supply-boat→supplyBoatVessels` · `workboat→workBoatVessels` · `crewboat→crewboatVessels` ·
`floatel→floatelVessels`. Thêm nhóm mới thì phải wire vào `src/data/vessels.ts`.

## Lưu ý

- **Idempotent**: chạy `add` lại với tàu đã có → bỏ qua, không nhân đôi.
- Nếu `vessel-master.csv` đang mở trong Excel (khoá) → tool ghi ra bản `-YYYY-MM-DD.csv`.
- Dữ liệu tàu trên nền tảng đọc **live từ Google Sheets**; sửa file JSON/CSV chỉ là
  fallback đóng gói — muốn lên live phải import lại CSV vào Sheet.
