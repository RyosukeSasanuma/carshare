import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CarForm } from "@/components/CarForm";
import { updateCar } from "@/app/admin/actions";

export default async function EditCarPage(props: PageProps<"/admin/cars/[id]/edit">) {
  const { id } = await props.params;

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand transition hover:text-brand-strong">← 管理に戻る</Link>
      <h1 className="mb-6 mt-3 font-display text-3xl text-foreground">車両を編集</h1>
      <CarForm action={updateCar} values={car} submitLabel="変更を保存" />
    </div>
  );
}
