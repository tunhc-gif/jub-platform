import { vesselsByType } from "@/data/vessels";
import VesselDetailView from "./view";

// Pre-render a static page for every bundled vessel (all categories).
export function generateStaticParams() {
  const out: { type: string; vesselId: string }[] = [];
  for (const [type, list] of Object.entries(vesselsByType)) {
    for (const v of list) out.push({ type, vesselId: v.id });
  }
  return out;
}

export default function Page({ params }: { params: { type: string; vesselId: string } }) {
  return <VesselDetailView params={params} />;
}
