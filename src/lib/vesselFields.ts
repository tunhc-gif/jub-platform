import { JubVessel } from "@/data/jubVessels";
import { DictKey } from "@/lib/i18n";

export type FieldDef = {
  key: keyof JubVessel;
  labelVi: string;
  labelEn: string;
  unit?: string;
};

export type SectionDef = {
  titleKey: DictKey;
  fields: FieldDef[];
};

export const vesselSections: SectionDef[] = [
  {
    titleKey: "generalInfo",
    fields: [
      { key: "idType", labelVi: "Loại tàu", labelEn: "Type" },
      { key: "idOwner", labelVi: "Chủ tàu", labelEn: "Owner" },
      { key: "idFlag", labelVi: "Cờ quốc tịch", labelEn: "Flag" },
      { key: "idPort", labelVi: "Cảng đăng ký", labelEn: "Port of registry" },
      { key: "idClassSociety", labelVi: "Đăng kiểm", labelEn: "Class society" },
      { key: "idNotation", labelVi: "Ký hiệu cấp tàu", labelEn: "Class notation" },
      { key: "idImo", labelVi: "Số IMO", labelEn: "IMO number" },
      { key: "idCallsign", labelVi: "Call sign", labelEn: "Call sign" },
      { key: "idMmsi", labelVi: "MMSI", labelEn: "MMSI" },
      { key: "idAbsNo", labelVi: "Số ABS", labelEn: "ABS number" },
      { key: "idRegNo", labelVi: "Số đăng ký", labelEn: "Registration number" },
      { key: "idDesigner", labelVi: "Nhà thiết kế", labelEn: "Designer" },
      { key: "idBuilder", labelVi: "Nhà đóng tàu", labelEn: "Builder" },
      { key: "idHullNo", labelVi: "Số vỏ", labelEn: "Hull number" },
      { key: "idYear", labelVi: "Năm đóng", labelEn: "Build year" },
      { key: "idLocation", labelVi: "Nơi đóng", labelEn: "Build location" },
    ],
  },
  {
    titleKey: "dimensions",
    fields: [
      { key: "dimLbp", labelVi: "LBP", labelEn: "LBP", unit: "m" },
      { key: "dimLoa", labelVi: "LOA (gồm helideck)", labelEn: "LOA (incl. helideck)", unit: "m" },
      { key: "dimWidth", labelVi: "Chiều rộng", labelEn: "Width/Breadth", unit: "m" },
      { key: "dimDepth", labelVi: "Chiều cao mạn", labelEn: "Depth of hull", unit: "m" },
      { key: "dimLegsQty", labelVi: "Số lượng chân", labelEn: "Number of legs" },
      { key: "dimLegType", labelVi: "Kiểu chân", labelEn: "Leg type" },
      { key: "dimLegLength", labelVi: "Chiều dài chân", labelEn: "Leg length", unit: "m" },
      { key: "dimLegTransverseCenters", labelVi: "Khoảng cách chân ngang", labelEn: "Transverse leg centers", unit: "m" },
      { key: "dimLegFwdAftDist", labelVi: "Khoảng cách chân trước-sau", labelEn: "Fwd-aft leg distance", unit: "m" },
      { key: "dimSpudcanHeight", labelVi: "Chiều cao spudcan", labelEn: "Spudcan height", unit: "m" },
      { key: "dimSpudcanArea", labelVi: "Diện tích đế spudcan", labelEn: "Spudcan footing area", unit: "m²" },
    ],
  },
  {
    titleKey: "weight",
    fields: [
      { key: "wtLightshipExLegs", labelVi: "Lightship (không kể chân)", labelEn: "Lightship (excl. legs)", unit: "mt" },
      { key: "wtLegsSpudcans", labelVi: "Trọng lượng chân + spudcan", labelEn: "Legs + spudcans weight", unit: "mt" },
      { key: "wtLightshipTotal", labelVi: "Tổng lightship", labelEn: "Total lightship", unit: "mt" },
      { key: "wtDisplacementLoaded", labelVi: "Displacement đầy tải", labelEn: "Loaded displacement", unit: "mt" },
      { key: "wtDraftLoaded", labelVi: "Mớn nước đầy tải", labelEn: "Loaded draft", unit: "m" },
    ],
  },
  {
    titleKey: "accommodation",
    fields: [
      { key: "accPobMax", labelVi: "Sức chứa tối đa (POB)", labelEn: "Max POB" },
      { key: "accDimsLwh", labelVi: "Kích thước khu nhà ở (L x W x H)", labelEn: "Accommodation size (L x W x H)" },
      { key: "heliDiameter", labelVi: "Đường kính sân bay trực thăng", labelEn: "Helideck diameter", unit: "m" },
      { key: "heliType", labelVi: "Loại trực thăng phù hợp", labelEn: "Compatible helicopter type" },
      { key: "heliMaxTow", labelVi: "Trọng lượng cất cánh tối đa", labelEn: "Max take-off weight", unit: "t" },
    ],
  },
  {
    titleKey: "cranes",
    fields: [
      { key: "craneMainQty", labelVi: "Số lượng cẩu chính", labelEn: "Main crane qty" },
      { key: "craneMainSwl", labelVi: "SWL cẩu chính", labelEn: "Main crane SWL" },
      { key: "craneMainWindLimit", labelVi: "Giới hạn gió cẩu chính", labelEn: "Main crane wind limit", unit: "m/s" },
      { key: "craneAuxQty", labelVi: "Số lượng cẩu phụ", labelEn: "Aux crane qty" },
      { key: "craneAuxSwl", labelVi: "SWL cẩu phụ", labelEn: "Aux crane SWL" },
      { key: "craneAuxWindLimit", labelVi: "Giới hạn gió cẩu phụ", labelEn: "Aux crane wind limit", unit: "m/s" },
    ],
  },
  {
    titleKey: "jacking",
    fields: [
      { key: "jackUnitsPerLeg", labelVi: "Số jacking unit/chân", labelEn: "Jacking units per leg" },
      { key: "jackUnitsTotal", labelVi: "Tổng số jacking unit", labelEn: "Total jacking units" },
      { key: "jackNormalCapUnit", labelVi: "Sức nâng bình thường/unit", labelEn: "Normal capacity/unit", unit: "t" },
      { key: "jackPreloadCapUnit", labelVi: "Sức nâng preload/unit", labelEn: "Preload capacity/unit", unit: "t" },
      { key: "jackMaxHoldingUnit", labelVi: "Sức giữ tối đa/unit", labelEn: "Max holding/unit", unit: "t" },
      { key: "jackStormHoldingUnit", labelVi: "Sức giữ khi bão/unit", labelEn: "Storm holding/unit", unit: "t" },
      { key: "jackSpeed", labelVi: "Tốc độ jacking", labelEn: "Jacking speed" },
      { key: "jackAlarmAngle", labelVi: "Góc báo động", labelEn: "Alarm angle" },
    ],
  },
  {
    titleKey: "power",
    fields: [
      { key: "pwrMainGenDesc", labelVi: "Máy phát chính", labelEn: "Main generators" },
      { key: "pwrMainGenUnitEkw", labelVi: "Công suất/máy", labelEn: "Power per unit", unit: "ekW" },
      { key: "pwrMainGenTotalEkw", labelVi: "Tổng công suất máy phát chính", labelEn: "Total main generator power", unit: "ekW" },
      { key: "pwrEmergGenDesc", labelVi: "Máy phát sự cố", labelEn: "Emergency generator" },
      { key: "pwrEmergGenEkw", labelVi: "Công suất máy phát sự cố", labelEn: "Emergency generator power", unit: "ekW" },
      { key: "pwrBowThruster", labelVi: "Bow thruster", labelEn: "Bow thruster" },
      { key: "pwrAftThruster", labelVi: "Aft azimuth thruster", labelEn: "Aft azimuth thruster" },
      { key: "pwrDpClass", labelVi: "Cấp DP", labelEn: "DP class" },
    ],
  },
  {
    titleKey: "tanks",
    fields: [
      { key: "tankFoTotalM3", labelVi: "Tổng dầu FO", labelEn: "Total fuel oil", unit: "m³" },
      { key: "tankFwTotalM3", labelVi: "Tổng nước ngọt", labelEn: "Total fresh water", unit: "m³" },
      { key: "tankBallastTotalM3", labelVi: "Tổng nước dằn", labelEn: "Total ballast water", unit: "m³" },
      { key: "tankBrineTotalM3", labelVi: "Tổng Brine water", labelEn: "Total brine water", unit: "m³" },
      { key: "tankBufferTotalM3", labelVi: "Tổng Buffer tank", labelEn: "Total buffer tank", unit: "m³" },
    ],
  },
  {
    titleKey: "envStorm",
    fields: [
      { key: "envStormWind", labelVi: "Gió thiết kế (1-min mean)", labelEn: "Design wind (1-min mean)", unit: "m/s" },
      { key: "envStormWave", labelVi: "Chiều cao sóng tối đa", labelEn: "Max wave height", unit: "m" },
      { key: "envStormPeriod", labelVi: "Chu kỳ sóng", labelEn: "Wave period", unit: "s" },
      { key: "envStormDepth", labelVi: "Độ sâu nước thiết kế", labelEn: "Design water depth", unit: "m" },
      { key: "envStormCurrent", labelVi: "Dòng chảy mặt nước", labelEn: "Surface current", unit: "m/s" },
      { key: "envStormAirgap", labelVi: "Air gap", labelEn: "Air gap", unit: "m" },
    ],
  },
  {
    titleKey: "envNormal",
    fields: [
      { key: "envNormalWind", labelVi: "Gió thiết kế", labelEn: "Design wind", unit: "m/s" },
      { key: "envNormalWave", labelVi: "Chiều cao sóng tối đa", labelEn: "Max wave height", unit: "m" },
      { key: "envNormalPeriod", labelVi: "Chu kỳ sóng", labelEn: "Wave period", unit: "s" },
      { key: "envNormalDepth", labelVi: "Độ sâu nước thiết kế", labelEn: "Design water depth", unit: "m" },
      { key: "envNormalAirgap", labelVi: "Air gap", labelEn: "Air gap", unit: "m" },
    ],
  },
  {
    titleKey: "opsLimits",
    fields: [
      { key: "opsFieldmoveWindKn", labelVi: "Giới hạn gió Field Move", labelEn: "Field move wind limit", unit: "knots" },
      { key: "opsFieldmoveWaveM", labelVi: "Giới hạn sóng Field Move", labelEn: "Field move wave limit", unit: "m" },
      { key: "opsFieldmoveBeaufort", labelVi: "Cấp Beaufort giới hạn", labelEn: "Beaufort limit" },
      { key: "opsJackingWind", labelVi: "Giới hạn gió Jacking Up/Down", labelEn: "Jacking up/down wind limit", unit: "m/s" },
      { key: "opsJackingWave", labelVi: "Giới hạn sóng Jacking Up/Down", labelEn: "Jacking up/down wave limit", unit: "m" },
      { key: "opsCraneWind", labelVi: "Giới hạn gió vận hành cẩu", labelEn: "Crane operation wind limit", unit: "m/s" },
      { key: "opsAirTemp", labelVi: "Nhiệt độ khí trời thiết kế", labelEn: "Design air temperature" },
      { key: "opsSeaTemp", labelVi: "Nhiệt độ nước biển thiết kế", labelEn: "Design sea temperature" },
    ],
  },
  {
    titleKey: "serviceOps",
    fields: [
      { key: "cargoDeckArea", labelVi: "Diện tích boong hàng", labelEn: "Cargo deck area" },
      { key: "dwt", labelVi: "Trọng tải (DWT)", labelEn: "Deadweight (DWT)" },
      { key: "speedKn", labelVi: "Tốc độ", labelEn: "Speed" },
      { key: "bollardPullT", labelVi: "Lực kéo (Bollard Pull)", labelEn: "Bollard pull" },
    ],
  },
  {
    titleKey: "source",
    fields: [
      { key: "srcDoc", labelVi: "Tài liệu nguồn", labelEn: "Source document" },
      { key: "srcDate", labelVi: "Ngày cập nhật", labelEn: "Last updated" },
    ],
  },
];
