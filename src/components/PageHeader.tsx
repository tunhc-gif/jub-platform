import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
};

export default function PageHeader({ backHref, backLabel, title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-brand-400"
      >
        <ChevronLeft size={16} />
        {backLabel}
      </Link>
      <div className="flex items-center gap-3">
        <span className="diagonal-tag h-6 w-2.5 shrink-0 bg-accent" />
        <h1 className="brand-headline text-2xl text-ink">{title}</h1>
      </div>
      {subtitle && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
    </div>
  );
}
