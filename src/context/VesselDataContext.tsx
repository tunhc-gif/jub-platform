"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { vesselsByType as bundledByType, Vessel } from "@/data/vessels";
import { parseCsv } from "@/lib/csv";
import { VESSEL_CSV_URL } from "@/config/vesselSource";

type VesselData = {
  vesselsByType: Record<string, Vessel[]>;
  allVessels: Vessel[];
  getVessel: (id: string) => Vessel | undefined;
  vesselsForType: (type: string) => Vessel[];
  source: "bundled" | "remote";
  ready: boolean; // true once the remote attempt has settled (or no URL configured)
};

const bundledAll: Vessel[] = Object.values(bundledByType).flat();

function groupByCategory(list: Vessel[]): Record<string, Vessel[]> {
  const byType: Record<string, Vessel[]> = {};
  for (const v of list) {
    const cat = v.category || "jub";
    (byType[cat] ??= []).push(v);
  }
  return byType;
}

const VesselDataContext = createContext<VesselData | undefined>(undefined);

export function VesselDataProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<Vessel[] | null>(null);
  const [ready, setReady] = useState<boolean>(!VESSEL_CSV_URL);

  useEffect(() => {
    if (!VESSEL_CSV_URL) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(VESSEL_CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const rows = parseCsv(text) as unknown as Vessel[];
        const clean = rows.filter((r) => r.id && r.displayName && r.category);
        if (!cancelled && clean.length > 0) setRemote(clean);
      } catch (e) {
        // Keep bundled data on any failure (offline, CORS, bad URL, etc.).
        console.warn("[VesselData] Không tải được dữ liệu từ Google Sheets, dùng dữ liệu đóng gói:", e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<VesselData>(() => {
    const useRemote = remote !== null;
    const allVessels = useRemote ? remote! : bundledAll;
    const vesselsByType = useRemote ? groupByCategory(remote!) : bundledByType;
    const index = new Map(allVessels.map((v) => [v.id, v]));
    return {
      vesselsByType,
      allVessels,
      getVessel: (id) => index.get(id),
      vesselsForType: (type) => vesselsByType[type] ?? [],
      source: useRemote ? "remote" : "bundled",
      ready,
    };
  }, [remote, ready]);

  return <VesselDataContext.Provider value={value}>{children}</VesselDataContext.Provider>;
}

export function useVesselData(): VesselData {
  const ctx = useContext(VesselDataContext);
  if (!ctx) throw new Error("useVesselData must be used within VesselDataProvider");
  return ctx;
}
