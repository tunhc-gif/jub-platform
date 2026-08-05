import { JubVessel } from "@/data/jubVessels";
import jubBase from "./jubVessels.json";
import jubExtra from "./jubExtra.json";
import ocv from "./ocvVessels.json";
import supplyBoat from "./supplyBoatVessels.json";
import workBoat from "./workBoatVessels.json";
import crewboat from "./crewboatVessels.json";
import floatel from "./floatelVessels.json";
import hlv from "./hlvVessels.json";
import dsv from "./dsvVessels.json";

// Every vessel carries its category slug so links and the AI Agent can route correctly.
export type Vessel = JubVessel & { category: string };

function tag(arr: unknown[], category: string): Vessel[] {
  return (arr as JubVessel[]).map((v) => ({ ...v, category }));
}

// Category slug -> vessels. Slugs match src/data/vesselTypes.ts.
export const vesselsByType: Record<string, Vessel[]> = {
  hlv: tag(hlv as unknown[], "hlv"),
  jub: tag([...(jubBase as unknown[]), ...(jubExtra as unknown[])], "jub"),
  ocv: tag(ocv as unknown[], "ocv"),
  dsv: tag(dsv as unknown[], "dsv"),
  "supply-boat": tag(supplyBoat as unknown[], "supply-boat"),
  workboat: tag(workBoat as unknown[], "workboat"),
  crewboat: tag(crewboat as unknown[], "crewboat"),
  floatel: tag(floatel as unknown[], "floatel"),
};

export const allVessels: Vessel[] = Object.values(vesselsByType).flat();

export function getVessel(id: string): Vessel | undefined {
  return allVessels.find((v) => v.id === id);
}

export function vesselsForType(type: string): Vessel[] {
  return vesselsByType[type] ?? [];
}
