import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CarForm } from "@/components/CarForm";
import { createCar } from "@/app/admin/actions";

export default async function NewCarPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/admin" className="text-sm text-brand transition hover:text-brand-strong">← 管理に戻る</Link>
      <h1 className="mb-6 mt-3 font-display text-3xl text-foreground">車両を追加</h1>
      <CarForm action={createCar} submitLabel="この内容で追加" />
    </div>
  );
}
