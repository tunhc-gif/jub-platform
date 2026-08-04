import { FolderSearch } from "lucide-react";

export default function NoDataCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-surface-2 px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-3 text-ink-soft">
        <FolderSearch size={26} />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{desc}</p>
    </div>
  );
}
