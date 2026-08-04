export type VesselType = {
  slug: string;
  code: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  hasData: boolean;
};

export const vesselTypes: VesselType[] = [
  {
    slug: "hlv",
    code: "HLV",
    nameVi: "Tàu cẩu nặng (Heavy Lift Vessel)",
    nameEn: "Heavy Lift Vessel",
    descVi: "Tàu chuyên dụng nâng/hạ, vận chuyển kết cấu nặng ngoài khơi.",
    descEn: "Specialised vessel for heavy-lift and transport of offshore structures.",
    hasData: false,
  },
  {
    slug: "jub",
    code: "JUB",
    nameVi: "Sà lan tự nâng (Jack-Up Barge / Liftboat)",
    nameEn: "Jack-Up Barge / Liftboat",
    descVi: "Công trình tự nâng dùng cho bảo trì, lưu trú và thi công ngoài khơi.",
    descEn: "Self-elevating unit used for offshore maintenance, accommodation and construction.",
    hasData: true,
  },
  {
    slug: "ocv",
    code: "OCV",
    nameVi: "Tàu công trình ngoài khơi (Offshore Construction Vessel)",
    nameEn: "Offshore Construction Vessel",
    descVi: "Tàu đa năng phục vụ thi công, lắp đặt công trình ngoài khơi.",
    descEn: "Multi-purpose vessel for offshore construction and installation work.",
    hasData: true,
  },
  {
    slug: "dsv",
    code: "DSV",
    nameVi: "Tàu lặn (Diving Support Vessel)",
    nameEn: "Diving Support Vessel",
    descVi: "Tàu hỗ trợ hoạt động lặn và can thiệp dưới nước.",
    descEn: "Vessel supporting diving operations and subsea intervention.",
    hasData: false,
  },
  {
    slug: "dlb",
    code: "DLB",
    nameVi: "Sà lan cẩu lắp đặt (Derrick Lay Barge)",
    nameEn: "Derrick Lay Barge",
    descVi: "Sà lan mang cẩu cỡ lớn phục vụ lắp đặt/rải đường ống ngoài khơi.",
    descEn: "Barge with heavy derrick crane for offshore installation and pipelay.",
    hasData: false,
  },
  {
    slug: "floatover-barge",
    code: "Floatover Barge",
    nameVi: "Sà lan Floatover",
    nameEn: "Floatover Barge",
    descVi: "Sà lan chuyên dụng lắp đặt topside bằng phương pháp floatover.",
    descEn: "Specialised barge for topside installation using the floatover method.",
    hasData: false,
  },
  {
    slug: "floatel",
    code: "Floatel",
    nameVi: "Nhà nổi lưu trú (Floatel)",
    nameEn: "Floatel",
    descVi: "Công trình nổi cung cấp chỗ ở cho nhân sự ngoài khơi.",
    descEn: "Floating accommodation unit for offshore personnel.",
    hasData: true,
  },
  {
    slug: "workboat",
    code: "Workboat",
    nameVi: "Tàu công vụ (Workboat)",
    nameEn: "Workboat",
    descVi: "Tàu đa dụng phục vụ công tác hỗ trợ ngoài khơi.",
    descEn: "Multi-purpose vessel for general offshore support work.",
    hasData: true,
  },
  {
    slug: "supply-boat",
    code: "Supply Boat",
    nameVi: "Tàu tiếp vận (Supply Boat)",
    nameEn: "Supply Boat",
    descVi: "Tàu vận chuyển vật tư, nhiên liệu, nước cho công trình ngoài khơi.",
    descEn: "Vessel transporting cargo, fuel and water to offshore installations.",
    hasData: true,
  },
  {
    slug: "crewboat",
    code: "Crewboat",
    nameVi: "Tàu chở người (Crewboat)",
    nameEn: "Crewboat",
    descVi: "Tàu tốc độ cao vận chuyển nhân sự ra/vào công trình ngoài khơi.",
    descEn: "High-speed vessel transporting crew to/from offshore installations.",
    hasData: true,
  },
];
