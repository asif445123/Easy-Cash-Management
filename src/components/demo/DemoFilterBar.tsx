"use client";

import { useRouter } from "next/navigation";
import { promptCreateAccount } from "./promptCreateAccount";

export interface DemoFilterField {
  label: string;
  value: string;
  type?: "date" | "select" | "text";
}

export default function DemoFilterBar({
  fields,
  toggle,
  compareLabel,
  radioGroup,
  actionLabel = "Preview",
  showPrint = true,
}: {
  fields: DemoFilterField[];
  toggle?: { options: string[]; active: string };
  compareLabel?: string;
  radioGroup?: { options: string[]; active: string };
  actionLabel?: string;
  showPrint?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="block text-sm font-medium text-ink/70 mb-1">{f.label}</label>
            <input
              type={f.type === "date" ? "text" : "text"}
              value={f.value}
              disabled
              readOnly
              title="Filters are illustrative in this demo"
              className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      {radioGroup && (
        <div className="flex items-center gap-4 mb-4 text-sm">
          {radioGroup.options.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-ink/70">
              <input type="radio" checked={opt === radioGroup.active} readOnly disabled />
              {opt}
            </label>
          ))}
        </div>
      )}

      {toggle && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex rounded-lg border border-ink/15 overflow-hidden">
            {toggle.options.map((opt) => (
              <span
                key={opt}
                className={`px-3 py-1.5 text-sm ${
                  opt === toggle.active ? "bg-primary text-white" : "text-ink/60"
                }`}
              >
                {opt}
              </span>
            ))}
          </div>
          {compareLabel && (
            <label className="flex items-center gap-1.5 text-sm text-ink/60">
              <input type="checkbox" disabled />
              {compareLabel}
            </label>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => promptCreateAccount(router, actionLabel)}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          {actionLabel}
        </button>
        {showPrint && (
          <button
            onClick={() => promptCreateAccount(router, "Print")}
            className="px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-sm font-medium hover:bg-ink/5 transition-colors"
          >
            Print
          </button>
        )}
      </div>
    </div>
  );
}
