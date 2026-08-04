// -----------------------------------------------------------------------------
// Nguồn dữ liệu tàu từ Google Sheets (tùy chọn).
//
// Cách dùng:
// 1. Tải file "vessel-master.csv" lên Google Drive, mở bằng Google Sheets.
// 2. File → Share → Publish to web → chọn sheet + định dạng "Comma-separated values (.csv)"
//    → Publish → sao chép URL (dạng .../pub?gid=...&single=true&output=csv).
// 3. Dán URL đó vào REMOTE_CSV_URL bên dưới (hoặc đặt biến môi trường
//    NEXT_PUBLIC_VESSEL_CSV_URL), lưu lại và refresh trang.
//
// Khi để trống, nền tảng dùng dữ liệu đóng gói sẵn trong src/data/*.json.
// Khi có URL, nền tảng ưu tiên dữ liệu từ Google Sheets (tự fallback về dữ liệu
// đóng gói nếu fetch lỗi).
// -----------------------------------------------------------------------------

const REMOTE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2haWQZnpcrkjLroMve3VkseQRWDBrTK9vO4Bx_QCgNeoiPC4k8U3dWqWNViX72mtmEf3JcIjgCX3w/pub?gid=0&single=true&output=csv";

export const VESSEL_CSV_URL =
  process.env.NEXT_PUBLIC_VESSEL_CSV_URL || REMOTE_CSV_URL || "";
