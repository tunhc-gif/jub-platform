import { vesselTypes } from "@/data/vesselTypes";
import VesselTypeView from "./view";

export function generateStaticParams() {
  return vesselTypes.map((t) => ({ type: t.slug }));
}

export default function Page({ params }: { params: { type: string } }) {
  return <VesselTypeView params={params} />;
}
