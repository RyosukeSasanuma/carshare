"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type CarFormState = { error?: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");
  return user;
}

const carSchema = z.object({
  name: z.string().min(1, "車両名を入力してください"),
  brand: z.string().min(1, "ブランドを入力してください"),
  model: z.string().min(1, "モデルを入力してください"),
  year: z.coerce.number().int().min(1980).max(2100),
  pricePerDay: z.coerce.number().int().min(0, "料金を正しく入力してください"),
  seats: z.coerce.number().int().min(1).max(50),
  transmission: z.string().min(1),
  fuel: z.string().min(1),
  location: z.string().min(1, "エリアを入力してください"),
  description: z.string().min(1, "説明を入力してください"),
  imageUrl: z
    .string()
    .min(1, "画像URLを入力してください")
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "画像URLまたはパスを入力してください"),
  isActive: z.coerce.boolean(),
});

function parseForm(formData: FormData) {
  return carSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year"),
    pricePerDay: formData.get("pricePerDay"),
    seats: formData.get("seats"),
    transmission: formData.get("transmission"),
    fuel: formData.get("fuel"),
    location: formData.get("location"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
}

export async function createCar(
  _prev: CarFormState,
  formData: FormData
): Promise<CarFormState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.car.create({ data: parsed.data });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateCar(
  _prev: CarFormState,
  formData: FormData
): Promise<CarFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.car.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleCarActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) return;
  await prisma.car.update({ where: { id }, data: { isActive: !car.isActive } });
  revalidatePath("/admin");
}
