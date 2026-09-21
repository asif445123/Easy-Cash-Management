"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface NarrationInputProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Narration field with comma-aware autocomplete: suggestions are filtered
 * against whatever you're typing AFTER the last comma, not the whole
 * value. So "Onion, T" suggests "Tomato" (if you've used it as a
 * narration before), and picking it produces "Onion, Tomato" — letting
 * you build up a combined narration from previously-used items, segment
 * by segment, no matter how many commas already come before it.
 *
 * Shows exactly ONE suggestion dropdown, positioned directly below the
 * field (no separate native browser autocomplete box — that was showing
 * a second, differently-positioned list alongside this one, which was
 * confusing).
 *
 * The dropdown is rendered via a portal into document.body and positioned
 * with the input's real on-screen coordinates, rather than being nested
 * absolutely inside the table cell. Table cells can clip or mis-position
 * ordinary `position: absolute` children depending on the browser's table
 * layout, which is what was causing suggestions to appear missing or
 * only work for some rows/segments.
 */
export default function NarrationInput({
  suggestions,
  value,
  onChange,
  placeholder,
}: NarrationInputProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function updateRect() {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom, left: r.left, width: r.width });
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateRect();
    function onScrollOrResize() {
      updateRect();
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  const lastCommaIndex = value.lastIndexOf(",");
  const prefix = lastCommaIndex === -1 ? "" : value.slice(0, lastCommaIndex + 1) + " ";
  const currentSegment = (lastCommaIndex === -1 ? value : value.slice(lastCommaIndex + 1)).trim();

  const filtered = currentSegment
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(currentSegment.toLowerCase()) &&
          s.toLowerCase() !== currentSegment.toLowerCase()
      )
    : [];

  function selectSuggestion(s: string) {
    onChange(prefix + s);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Narration"}
        className="input"
        autoComplete="off"
      />
      {open &&
        filtered.length > 0 &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "fixed", top: rect.top + 4, left: rect.left, width: rect.width }}
            className="max-h-40 overflow-y-auto bg-white rounded-lg border border-ink/15 shadow-lg z-50"
          >
            {filtered.map((s) => (
              <button
                type="button"
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-ink/5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
