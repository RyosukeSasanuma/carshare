import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/CarCard";
import { SearchBar } from "@/components/SearchBar";
import { getUnavailableCarIds, parseDate, calcDays, formatDate } from "@/lib/booking";
import type { Prisma } from "@/generated/prisma/client";

export default async function CarsPage(props: PageProps<"/cars">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const location = typeof sp.location === "string" ? sp.location : "";
  const startStr = typeof sp.start === "string" ? sp.start : "";
  const endStr = typeof sp.end === "string" ? sp.end : "";

  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const validRange = start && end && end > start;

  const where: Prisma.CarWhereInput = { isActive: true };
  const and: Prisma.CarWhereInput[] = [];
  if (q) {
    and.push({
      OR: [{ name: { contains: q } }, { brand: { contains: q } }, { model: { contains: q } }],
    });
  }
  if (location) and.push({ location: { contains: location } });
  if (and.length) where.AND = and;

  let cars = await prisma.car.findMany({ where, orderBy: { pricePerDay: "asc" } });

  let unavailableNote = "";
  if (validRange) {
    const unavailable = await getUnavailableCarIds(start!, end!);
    cars = cars.filter((c) => !unavailable.has(c.id));
    unavailableNote = `${formatDate(start!)} 〜 ${formatDate(end!)}（${calcDays(start!, end!)}日間）で予約可能な車`;
  }

  const query = new URLSearchParams();
  if (startStr) query.set("start", startStr);
  if (endStr) query.set("end", endStr);
  const queryStr = query.toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-brand">Lineup</p>
      <h1 className="mb-6 mt-2 font-display text-3xl text-foreground">車を探す</h1>

      <SearchBar
        defaultStart={startStr}
        defaultEnd={endStr}
        defaultLocation={location}
        defaultQ={q}
      />

      <p className="mt-5 text-sm text-muted">
        {unavailableNote || `${cars.length}台の車が見つかりました`}
        {unavailableNote && `：${cars.length}台`}
      </p>

      {cars.length === 0 ? (
        <p className="mt-12 text-center text-muted">
          条件に合う車が見つかりませんでした。条件を変えてお試しください。
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} query={queryStr} />
          ))}
        </div>
      )}
    </div>
  );
}
