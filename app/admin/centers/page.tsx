"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Center, Location } from "@/lib/types";

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

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  state: "",
  city: "",
};

export default function CentersPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [centers, setCenters] = useState<Center[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [c, l] = await Promise.all([
        api.get<Center[]>("/centers"),
        api.get<Location[]>("/locations"),
      ]);

      setCenters(Array.isArray(c) ? c : []);
      setLocations(Array.isArray(l) ? l : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load centers"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    load();
  }, [session]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setNotice(null);
    setSaving(true);

    try {
      await api.post("/centers", form);

      setCreateOpen(false);
      setForm(emptyForm);
      setNotice("Center created.");

      await load();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not create center"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Center) {
    if (!confirm(`Remove center "${c.name}"?`)) return;

    setError(null);
    setNotice(null);

    try {
      await api.delete(`/centers/${c.id}`);
      setNotice("Center removed.");
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not remove center"
      );
    }
  }

  if (!session) return null;

  return (
    <AppShell
      navItems={NAV}
      roleLabel={session.role}
      userName={session.name}
      loginPath="/login/admin"
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="case-label text-brass-dark">Field Offices</p>
          <h1 className="font-display text-3xl font-bold text-ink">
            Centers
          </h1>
        </div>

        <Button
          onClick={() => {
            setFormError(null);
            setCreateOpen(true);
          }}
        >
          + Add Center
        </Button>
      </header>

      {notice && (
        <div className="mb-4">
          <Notice kind="success">{notice}</Notice>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      <Card padded={false}>
        <table className="w-full text-left text-sm">
          <thead className="case-label text-ink/40">
            <tr className="border-b border-ink/10">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-ink/40"
                >
                  Loading centers...
                </td>
              </tr>
            ) : centers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-ink/40"
                >
                  No centers yet.
                </td>
              </tr>
            ) : (
              centers.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink/5 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-ink">
                    {c.name}
                  </td>

                  <td className="px-4 py-3 text-ink/60">
                    {c.email}
                  </td>

                  <td className="px-4 py-3 font-mono text-ink/60">
                    {c.mobile}
                  </td>

                  <td className="px-4 py-3 text-ink/60">
                    {c.city}, {c.state}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-xs font-semibold text-stamp hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Center"
      >
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4"
        >
          {formError && (
            <Notice kind="error">{formError}</Notice>
          )}

          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <Input
            label="Mobile"
            required
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile: e.target.value,
              })
            }
          />

          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <Select
            label="State"
            required
            value={form.state}
            onChange={(e) =>
              setForm({
                ...form,
                state: e.target.value,
                city: "",
              })
            }
          >
            <option value="">Select state...</option>

            {locations.map((l) => (
              <option
                key={l.state}
                value={l.state}
              >
                {l.state}
              </option>
            ))}
          </Select>

          <Input
            label="City"
            required
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value,
              })
            }
            hint={
              form.state
                ? `Registered city for ${form.state}: ${
                    locations.find(
                      (l) => l.state === form.state
                    )?.city || ""
                  }`
                : undefined
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
            >
              Create center
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}