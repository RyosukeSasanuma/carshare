"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  defaultStart?: string;
  defaultEnd?: string;
  defaultLocation?: string;
  defaultQ?: string;
};

export function SearchBar({ defaultStart, defaultEnd, defaultLocation, defaultQ }: Props) {
  const router = useRouter();
  const [start, setStart] = useState(defaultStart ?? "");
  const [end, setEnd] = useState(defaultEnd ?? "");
  const [location, setLocation] = useState(defaultLocation ?? "");
  const [q, setQ] = useState(defaultQ ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (location) params.set("location", location);
    if (q) params.set("q", q);
    router.push(`/cars${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-1">
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">キーワード</label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="車種・ブランド"
          className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">エリア</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="東京都"
          className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">利用開始日</label>
        <input
          type="date"
          value={start}
          min={today}
          onChange={(e) => setStart(e.target.value)}
          className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-brand"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">返却日</label>
        <input
          type="date"
          value={end}
          min={start || today}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-brand"
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-background transition hover:bg-brand-strong"
        >
          検索
        </button>
      </div>
    </form>
  );
}
