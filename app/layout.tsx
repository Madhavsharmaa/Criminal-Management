import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Case File — Criminal Record Management",
  description: "Criminal record management system for police centers and administrators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
