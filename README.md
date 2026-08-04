# Offshore Fleet Platform

Nền tảng web (Next.js 14 + TypeScript + Tailwind CSS) tổng hợp dữ liệu **Vessel**, **Offshore Area** và **Weather Downtime**, theo cấu trúc đã thống nhất:

- Trang chủ: 3 khối chính — **Vessel**, **Offshore Area**, **Weather Downtime**.
- Nút **Theme** (đổi bảng màu) ở góc trên bên phải.
- Nút **Language / League** (đổi ngôn ngữ VN/EN) ở góc trên bên phải.
- Nút **AI Agent** (tìm kiếm tàu) nổi ở góc dưới bên phải — bản demo tìm kiếm cục bộ trên dữ liệu JUB, chưa nối AI thật.
- **Vessel** → grid 10 loại tàu/công trình nổi (HLV, JUB, OCV, DSV, DLB, Floatover Barge, Floatel, Workboat, Supply Boat, Crewboat). Riêng **JUB** có dữ liệu thật của 10 tàu (lấy từ `Vessel_Technical_Database.xlsx`); các loại khác hiển thị "Chưa có dữ liệu" chờ bổ sung.
- **Offshore Area** → grid 5 quốc gia (Việt Nam, Qatar, KSA, UAE, Nigeria), hiện tất cả đang ở trạng thái "Chưa có dữ liệu" chờ bổ sung.
- **Weather Downtime** → trang placeholder "Sắp ra mắt".

## Cài đặt & chạy thử

Yêu cầu: Node.js 18+ và npm.

```bash
cd jub-platform
npm install
npm run dev
```

Mở http://localhost:3000.

Build production:

```bash
npm run build
npm run start
```

> Đã build thử thành công trong quá trình tạo project này (Next.js 14.2.35, biên dịch không lỗi TypeScript, 7 route tạo thành công).

## Cấu trúc thư mục

```
src/
  app/
    layout.tsx                     # layout gốc: Header + AI Agent + Providers
    page.tsx                       # trang chủ: 3 khối chính
    globals.css                    # biến CSS cho 4 theme màu
    vessel/
      page.tsx                     # grid 10 loại tàu
      [type]/page.tsx              # danh sách tàu theo loại (JUB có dữ liệu thật)
      [type]/[vesselId]/page.tsx   # trang chi tiết 1 tàu (11 nhóm thông số)
    offshore-area/
      page.tsx                     # grid 5 quốc gia
      [country]/page.tsx           # trang quốc gia (placeholder)
    weather-downtime/page.tsx      # placeholder "Sắp ra mắt"
  components/
    Header.tsx, ThemeSwitcher.tsx, LanguageSwitcher.tsx
    AIAgent.tsx                    # nút nổi + panel tìm kiếm tàu
    BlockCard.tsx, PageHeader.tsx, NoDataCard.tsx, Providers.tsx
  context/
    ThemeContext.tsx               # 4 theme: ocean, sunset, emerald, slate
    LanguageContext.tsx            # vi / en, lưu localStorage
  data/
    jubVessels.json / .ts          # dữ liệu thật 10 tàu JUB (từ file Excel)
    vesselTypes.ts                 # danh mục 10 loại tàu
    countries.ts                   # danh mục 5 quốc gia
  lib/
    i18n.ts                        # từ điển VN/EN
    vesselFields.ts                # định nghĩa 11 nhóm thông số hiển thị chi tiết tàu
```

## Cách bổ sung dữ liệu sau này

- **Thêm loại tàu có dữ liệu**: sửa `hasData: true` trong `src/data/vesselTypes.ts`, tạo dữ liệu tương tự `jubVessels.ts`/`.json`, rồi cập nhật `src/app/vessel/[type]/page.tsx` để đọc đúng nguồn dữ liệu theo `params.type`.
- **Thêm dữ liệu vùng biển**: tạo file dữ liệu trong `src/data/`, cập nhật `hasData: true` trong `countries.ts` và bổ sung nội dung vào `src/app/offshore-area/[country]/page.tsx`.
- **Nối AI Agent thật**: thay phần tìm kiếm cục bộ trong `src/components/AIAgent.tsx` bằng API call tới backend/LLM thật (ví dụ route `/api/ai-agent`).
- **Thêm theme/ngôn ngữ**: thêm palette mới trong `globals.css` + `ThemeContext.tsx` (theme), hoặc thêm ngôn ngữ mới trong `i18n.ts` + `LanguageContext.tsx`.

## Ghi chú

- Dữ liệu 10 tàu JUB được trích xuất từ Operation Manual gốc (xem `Vessel_Technical_Database.xlsx` trong cùng thư mục VESSEL) — một số trường có ghi chú "Không tìm thấy"/N/A do tài liệu nguồn không nêu rõ; nên đối chiếu lại hồ sơ đăng kiểm gốc trước khi dùng cho báo cáo chính thức.
- `node_modules` không được đóng gói theo dự án — chạy `npm install` để tạo lại.
