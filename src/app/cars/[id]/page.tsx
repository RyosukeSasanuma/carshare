import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookingWidget } from "@/components/BookingWidget";

export default async function CarDetailPage(props: PageProps<"/cars/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const start = typeof sp.start === "string" ? sp.start : undefined;
  const end = typeof sp.end === "string" ? sp.end : undefined;

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car || !car.isActive) notFound();

  const user = await getCurrentUser();

  const specs = [
    { label: "ブランド", value: car.brand },
    { label: "年式", value: `${car.year}年` },
    { label: "定員", value: `${car.seats}人` },
    { label: "ミッション", value: car.transmission },
    { label: "燃料", value: car.fuel },
    { label: "エリア", value: car.location },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/cars" className="text-sm text-brand transition hover:text-brand-strong">
        ← 車一覧に戻る
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-line bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={car.imageUrl} alt={car.name} className="aspect-[16/9] w-full object-cover" />
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-brand">{car.brand}</p>
          <h1 className="mt-1.5 font-display text-3xl text-foreground">{car.name}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
                <dt className="text-xs uppercase tracking-wider text-muted">{s.label}</dt>
                <dd className="mt-1 font-medium text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <h2 className="font-display text-lg text-foreground">この車について</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted">{car.description}</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <BookingWidget
              carId={car.id}
              pricePerDay={car.pricePerDay}
              isLoggedIn={!!user}
              defaultStart={start}
              defaultEnd={end}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
