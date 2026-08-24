"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { clearSession } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
}

export default function AppShell({
  navItems,
  roleLabel,
  userName,
  children,
  loginPath,
}: {
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  children: ReactNode;
  loginPath: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace(loginPath);
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-shrink-0 flex-col bg-ink text-paper">
          <div className="flex items-center gap-2.5 border-b border-white/10 px-6 py-6">
            <span className="stamp-badge border-brass text-brass text-[0.6rem]">CFM</span>
            <div>
              <p className="font-display text-sm font-bold leading-tight">The Case File</p>
              <p className="case-label text-white/40">{roleLabel}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-white/10 text-paper" : "text-white/60 hover:bg-white/5 hover:text-paper"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 px-6 py-4">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <button onClick={logout} className="case-label mt-2 text-stamp hover:text-stamp/80">
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
