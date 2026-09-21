"use client";

import { useState } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

/** Password field with a 👁️ / 👁️‍🗨️ toggle button to show or hide the value. */
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink/15 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-base leading-none text-ink/50 hover:text-ink transition-colors"
        tabIndex={-1}
      >
        {showPassword ? "👁️" : "👁️‍🗨️"}
      </button>
    </div>
  );
}
