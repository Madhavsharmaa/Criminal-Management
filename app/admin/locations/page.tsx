"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Location } from "@/lib/types";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/criminals", label: "Criminal Records" },
  { href: "/admin/scan", label: "Face Scan" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/centers", label: "Centers" },
  { href: "/admin/remarks", label: "Remarks" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/admins", label: "Administrators" },
  { href: "/admin/change-password", label: "Change Password" },
];

export default function LocationsPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [locations, setLocations] = useState<Location[]>([]);
  const [statesCities, setStatesCities] = useState<Record<string, string[]>>({});
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [locs, states] = await Promise.all([
      api.get<Location[]>("/locations"),
      api.get<Record<string, string[]>>("/locations/states"),
    ]);
    setLocations(locs);
    setStatesCities(states);
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const cityOptions = state ? statesCities[state] || [] : [];

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/locations", { state, city });
      setState("");
      setCity("");
      setNotice("Location added.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add location");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(stateName: string) {
    if (!confirm(`Delete location entry for "${stateName}"?`)) return;
    setError(null);
    try {
      await api.delete(`/locations/${encodeURIComponent(stateName)}`);
      setNotice("Location deleted.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete location");
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Geography</p>
        <h1 className="font-display text-3xl font-bold text-ink">Locations</h1>
        <p className="mt-1 text-sm text-ink/60">
          Each state maps to a single operating city, used when creating field centers.
        </p>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="case-label mb-4 text-brass-dark">Add location</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <Select
              label="State"
              required
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setCity("");
              }}
            >
              <option value="">Select state…</option>
              {Object.keys(statesCities).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select label="City" required value={city} onChange={(e) => setCity(e.target.value)} disabled={!state}>
              <option value="">Select city…</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button type="submit" loading={saving} disabled={!state || !city}>
              Add location
            </Button>
          </form>
        </Card>

        <Card padded={false}>
          <table className="w-full text-left text-sm">
            <thead className="case-label text-ink/40">
              <tr className="border-b border-ink/10">
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.state} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{l.state}</td>
                  <td className="px-4 py-3 text-ink/60">{l.city}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(l.state)} className="text-xs font-semibold text-stamp hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink/40">
                    No locations added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
