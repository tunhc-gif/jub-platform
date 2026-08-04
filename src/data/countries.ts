export type Country = {
  slug: string;
  code: string;
  nameVi: string;
  nameEn: string;
  region: string;
  flag: string;
  hasData: boolean;
};

export const countries: Country[] = [
  {
    slug: "vietnam",
    code: "VN",
    nameVi: "Việt Nam",
    nameEn: "Vietnam",
    region: "Đông Nam Á / Southeast Asia",
    flag: "🇻🇳",
    hasData: false,
  },
  {
    slug: "qatar",
    code: "QA",
    nameVi: "Qatar",
    nameEn: "Qatar",
    region: "Trung Đông / Middle East",
    flag: "🇶🇦",
    hasData: false,
  },
  {
    slug: "ksa",
    code: "KSA",
    nameVi: "Ả Rập Xê Út",
    nameEn: "Saudi Arabia (KSA)",
    region: "Trung Đông / Middle East",
    flag: "🇸🇦",
    hasData: false,
  },
  {
    slug: "uae",
    code: "UAE",
    nameVi: "UAE",
    nameEn: "United Arab Emirates",
    region: "Trung Đông / Middle East",
    flag: "🇦🇪",
    hasData: false,
  },
  {
    slug: "nigeria",
    code: "NG",
    nameVi: "Nigeria",
    nameEn: "Nigeria",
    region: "Tây Phi / West Africa",
    flag: "🇳🇬",
    hasData: false,
  },
];
