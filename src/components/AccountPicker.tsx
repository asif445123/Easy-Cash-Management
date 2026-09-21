"use client";

import { useEffect, useRef, useState } from "react";

interface AccountOption {
  code: string;
  description: string;
}

interface AccountPickerProps {
  accounts: AccountOption[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Text input that filters the account list as you type (matching against
 * both code and description), with a click-to-select dropdown — a
 * searchable replacement for a long <select> of accounts.
 */
export default function AccountPicker({
  accounts,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}: AccountPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = accounts.find((a) => a.code === value);
  const displayValue = open ? query : selected ? `${selected.code} — ${selected.description}` : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? accounts.filter(
        (a) =>
          a.code.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase())
      )
    : accounts;

  function selectAccount(a: AccountOption) {
    onChange(a.code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <input
        value={displayValue}
        onChange={(e) => {
          if (disabled) return;
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(""); // typing invalidates the previous selection until a new one is clicked
        }}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setQuery("");
        }}
        placeholder={placeholder || "Search account…"}
        className="input disabled:bg-ink/5 disabled:text-ink/40"
        autoComplete="off"
        required={required}
        disabled={disabled}
      />
      {open && !disabled && (
        <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white rounded-lg border border-ink/15 shadow-lg z-30">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-ink/40">No matching accounts</div>
          ) : (
            filtered.map((a) => (
              <button
                type="button"
                key={a.code}
                onMouseDown={(e) => e.preventDefault()} // keep focus so onBlur/outside-click doesn't fire first
                onClick={() => selectAccount(a)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-ink/5 transition-colors"
              >
                <span className="font-medium text-ink">{a.code}</span>{" "}
                <span className="text-ink/60">— {a.description}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
