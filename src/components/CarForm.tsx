"use client";

import { useActionState } from "react";
import type { CarFormState } from "@/app/admin/actions";

type CarValues = {
  id?: string;
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  pricePerDay?: number;
  seats?: number;
  transmission?: string;
  fuel?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
};

const initial: CarFormState = {};
const inputCls =
  "w-full rounded-lg border border-line bg-background px-3 py-2.5 text-foreground outline-none transition placeholder:text-muted/60 focus:border-brand";
const labelCls = "mb-1.5 block text-xs uppercase tracking-wider text-muted";

export function CarForm({
  action,
  values = {},
  submitLabel,
}: {
  action: (prev: CarFormState, formData: FormData) => Promise<CarFormState>;
  values?: CarValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div>
        <label className={labelCls}>車両名</label>
        <input name="name" defaultValue={values.name} required className={inputCls} placeholder="アストンマーティン DB11" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>ブランド</label>
          <input name="brand" defaultValue={values.brand} required className={inputCls} placeholder="Aston Martin" />
        </div>
        <div>
          <label className={labelCls}>モデル</label>
          <input name="model" defaultValue={values.model} required className={inputCls} placeholder="DB11 V12" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className={labelCls}>年式</label>
          <input name="year" type="number" defaultValue={values.year ?? 2023} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>定員</label>
          <input name="seats" type="number" defaultValue={values.seats ?? 5} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ミッション</label>
          <select name="transmission" defaultValue={values.transmission ?? "AT"} className={inputCls}>
            <option value="AT">AT</option>
            <option value="MT">MT</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>燃料</label>
          <select name="fuel" defaultValue={values.fuel ?? "ガソリン"} className={inputCls}>
            <option value="ガソリン">ガソリン</option>
            <option value="ハイブリッド">ハイブリッド</option>
            <option value="EV">EV</option>
            <option value="ディーゼル">ディーゼル</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>料金（円/日）</label>
          <input name="pricePerDay" type="number" defaultValue={values.pricePerDay ?? 42000} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>エリア</label>
          <input name="location" defaultValue={values.location} required className={inputCls} placeholder="東京都港区" />
        </div>
      </div>

      <div>
        <label className={labelCls}>画像URL</label>
        <input name="imageUrl" defaultValue={values.imageUrl ?? "/cars/aston-db11.svg"} required className={inputCls} placeholder="/cars/aston-db11.svg" />
      </div>

      <div>
        <label className={labelCls}>説明</label>
        <textarea name="description" defaultValue={values.description} required rows={4} className={inputCls} />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="isActive" defaultChecked={values.isActive ?? true} className="h-4 w-4 accent-[color:var(--brand)]" />
        公開する（ユーザーに表示・予約可能にする）
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand py-3 font-semibold text-background transition hover:bg-brand-strong disabled:opacity-40"
      >
        {pending ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}
