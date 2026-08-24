"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold text-sm tracking-wide px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stamp";

const variants: Record<Variant, string> = {
  primary: "bg-stamp text-paper hover:bg-stamp-dark",
  secondary: "bg-ink text-paper hover:bg-ink-soft",
  ghost: "bg-transparent text-ink border border-ink/20 hover:bg-ink/5",
  danger: "bg-transparent text-stamp border border-stamp/40 hover:bg-stamp-light",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
