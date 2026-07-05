import Link from "next/link";
import { formatYen } from "@/lib/booking";

type Car = {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuel: string;
  location: string;
  imageUrl: string;
};

export function CarCard({ car, query }: { car: Car; query?: string }) {
  const href = query ? `/cars/${car.id}?${query}` : `/cars/${car.id}`;
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-brand/40"
    >
      <div className="aspect-[16/10] overflow-hidden bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={car.imageUrl}
          alt={car.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand">{car.brand}</p>
        <h3 className="mt-1.5 font-display text-lg text-foreground">{car.name}</h3>
        <p className="mt-1 text-xs text-muted">{car.location}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted">
          <span className="rounded-full border border-line px-2.5 py-0.5">{car.seats}人乗り</span>
          <span className="rounded-full border border-line px-2.5 py-0.5">{car.transmission}</span>
          <span className="rounded-full border border-line px-2.5 py-0.5">{car.fuel}</span>
        </div>
        <div className="mt-4 flex items-baseline justify-end gap-1 border-t border-line pt-3">
          <span className="font-display text-xl text-brand">{formatYen(car.pricePerDay)}</span>
          <span className="text-xs text-muted"> / 日</span>
        </div>
      </div>
    </Link>
  );
}
