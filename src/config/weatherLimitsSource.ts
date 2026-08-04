// -----------------------------------------------------------------------------
// Nguồn bảng giới hạn Weather Downtime theo loại tàu (Google Sheets, tùy chọn).
//
// Cách dùng:
// 1. Trong Google Sheet, tạo một sheet/tab mới (VD "WD Limits") và import
//    file "weather-downtime-limits.csv" vào tab đó (giữ nguyên dòng tiêu đề:
//    type,code,relocationHs,relocationWindKn,workingHs,workingWindKn).
// 2. File → Share → Publish to web → chọn ĐÚNG tab đó → định dạng CSV → Publish
//    → copy URL (dạng .../pub?gid=XXXX&single=true&output=csv, gid khác tab vessel).
// 3. Dán URL vào REMOTE_WD_LIMITS_CSV_URL bên dưới (hoặc đặt biến môi trường
//    NEXT_PUBLIC_WD_LIMITS_CSV_URL), lưu và refresh.
//
// Để trống: nền tảng dùng bảng giới hạn mặc định trong src/data/weatherLimits.ts.
// -----------------------------------------------------------------------------

const REMOTE_WD_LIMITS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2haWQZnpcrkjLroMve3VkseQRWDBrTK9vO4Bx_QCgNeoiPC4k8U3dWqWNViX72mtmEf3JcIjgCX3w/pub?gid=566339449&single=true&output=csv";

export const WD_LIMITS_CSV_URL =
  process.env.NEXT_PUBLIC_WD_LIMITS_CSV_URL || REMOTE_WD_LIMITS_CSV_URL || "";
