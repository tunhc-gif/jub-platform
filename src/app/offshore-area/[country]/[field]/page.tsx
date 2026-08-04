import { offshoreFields } from "@/data/offshoreAreas";
import FieldDetailView from "./view";

export function generateStaticParams() {
  return offshoreFields.map((f) => ({ country: f.countrySlug, field: f.slug }));
}

export default function Page({ params }: { params: { country: string; field: string } }) {
  return <FieldDetailView params={params} />;
}
