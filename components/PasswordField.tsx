"use client";

import { InputHTMLAttributes, useState } from "react";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function PasswordField({
  label,
  error,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label ? (
        <label className="mb-2 block text-sm font-semibold text-slate-600">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 pr-20 text-slate-700 outline-none focus:border-brand-700 ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
