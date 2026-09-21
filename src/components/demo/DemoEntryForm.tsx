"use client";

import { useRouter } from "next/navigation";
import { promptCreateAccount } from "./promptCreateAccount";

export interface DemoFormField {
  label: string;
  value: string;
  placeholder?: string;
}

export default function DemoEntryForm({
  fields,
  saveLabel = "Save",
  note,
}: {
  fields: DemoFormField[];
  saveLabel?: string;
  note?: string;
}) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="block text-sm font-medium text-ink/70 mb-1">{f.label}</label>
            <input
              type="text"
              value={f.value}
              placeholder={f.placeholder}
              disabled
              readOnly
              title="This is a read-only demo form"
              className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
            />
          </div>
        ))}
      </div>
      {note && <p className="text-xs text-ink/40 mb-3">{note}</p>}
      <button
        onClick={() => promptCreateAccount(router, saveLabel)}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        {saveLabel}
      </button>
    </div>
  );
}
