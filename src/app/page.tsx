import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/CarCard";
import { SearchBar } from "@/components/SearchBar";

export default async function Home() {
  const cars = await prisma.car.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* ヒーロー */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, rgba(200,164,92,0.18), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-28 text-center sm:py-36">
          <p className="text-xs uppercase tracking-[0.4em] text-brand">Luxury Car Share</p>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight text-foreground sm:text-6xl">
            特別な一日を、<br className="hidden sm:block" />最上級の一台とともに。
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            アストンマーティン DB11、ランドローバー ディフェンダー 110。
            厳選されたラグジュアリーカーを、シンプルな予約で。
          </p>
          <div className="mt-10">
            <Link
              href="/cars"
              className="inline-block rounded-full bg-brand px-10 py-3.5 text-sm font-semibold tracking-wide text-background transition hover:bg-brand-strong"
            >
              ラインナップを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 検索バー */}
      <section className="mx-auto -mt-8 max-w-5xl px-4">
        <SearchBar />
      </section>

      {/* 特徴 */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { no: "01", title: "厳選された車両", desc: "名門ブランドの一台を、確かなコンディションでご用意" },
            { no: "02", title: "24時間オンライン予約", desc: "いつでも空車確認・予約・キャンセルが可能" },
            { no: "03", title: "安心の保険付帯", desc: "すべての予約に車両保険を自動で付帯" },
          ].map((f) => (
            <div key={f.no} className="rounded-2xl border border-line bg-surface p-8">
              <div className="font-display text-3xl text-brand">{f.no}</div>
              <h3 className="mt-4 font-display text-lg text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ラインナップ */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Lineup</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">ラインナップ</h2>
          </div>
          <Link href="/cars" className="text-sm font-medium text-brand transition hover:text-brand-strong">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>
    </div>
  );
}
