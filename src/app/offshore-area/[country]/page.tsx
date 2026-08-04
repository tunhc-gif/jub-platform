import { offshoreCountries } from "@/data/offshoreAreas";
import CountryDetailView from "./view";

export function generateStaticParams() {
  return offshoreCountries.map((c) => ({ country: c.slug }));
}

export default function Page({ params }: { params: { country: string } }) {
  return <CountryDetailView params={params} />;
}
