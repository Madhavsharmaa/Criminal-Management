"use client";

import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldWrapProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}

export function FieldWrap({ label, htmlFor, children, hint }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="case-label text-ink/60">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-ink/40">{hint}</span>}
    </div>
  );
}

const controlClass =
  "w-full rounded-md border border-ink/15 bg-paper-card px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-stamp/40 focus:border-stamp/60";

export function Input({
  label,
  hint,
  className = "",
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrap label={label} htmlFor={props.id} hint={hint}>
      <input className={`${controlClass} ${className}`} {...props} />
    </FieldWrap>
  );
}

export function TextArea({
  label,
  hint,
  className = "",
  ...props
}: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrap label={label} htmlFor={props.id} hint={hint}>
      <textarea className={`${controlClass} min-h-[96px] resize-y`} {...props} />
    </FieldWrap>
  );
}

export function Select({
  label,
  hint,
  className = "",
  children,
  ...props
}: { label: string; hint?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrap label={label} htmlFor={props.id} hint={hint}>
      <select className={`${controlClass} ${className}`} {...props}>
        {children}
      </select>
    </FieldWrap>
  );
}
