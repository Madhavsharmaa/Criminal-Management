import Link from "next/link";

export default function Home() {
  return (
    <main className="paper-texture flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <span className="stamp-badge animate-stamp mx-auto mb-6 inline-flex border-stamp text-stamp text-sm">
            Case Management System
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            The Case File
          </h1>
          <p className="case-label mt-3 text-ink/40">Criminal Record Management</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/login/admin"
            className="group rounded-xl border border-ink/10 bg-paper-card p-8 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <p className="case-label text-brass-dark">Headquarters</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">Admin Login</h2>
            <p className="mt-2 text-sm text-ink/60">
              Manage criminal records, categories, centers, and system administrators.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-stamp group-hover:underline">
              Continue →
            </span>
          </Link>

          <Link
            href="/login/center"
            className="group rounded-xl border border-ink/10 bg-paper-card p-8 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <p className="case-label text-brass-dark">Field Office</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">Center Login</h2>
            <p className="mt-2 text-sm text-ink/60">
              Look up criminal records, log field remarks, and file reports.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-stamp group-hover:underline">
              Continue →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
