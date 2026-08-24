import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-ink/10 bg-paper-card shadow-card ${padded ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}
