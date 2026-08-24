"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextArea } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import StampBadge from "@/components/ui/StampBadge";
import { useRequireAuth } from "@/lib/useAuth";
import { api, uploadUrl } from "@/lib/api";
import type { Criminal } from "@/lib/types";

const NAV = [
  { href: "/center/dashboard", label: "Dashboard" },
  { href: "/center/criminals", label: "Criminal Records" },
  { href: "/center/remarks", label: "My Remarks" },
  { href: "/center/change-password", label: "Change Password" },
];

export default function CenterCriminalsPage() {
  const session = useRequireAuth(["Center"], "/login/center");
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [remarkTarget, setRemarkTarget] = useState<Criminal | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [remarkError, setRemarkError] = useState<string | null>(null);

  async function load(q?: string) {
    try {
      setCriminals(await api.get<Criminal[]>(`/criminals${q ? `?q=${encodeURIComponent(q)}` : ""}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load records");
    }
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function search(e: FormEvent) {
    e.preventDefault();
    load(query);
  }

  async function submitRemark(e: FormEvent) {
    e.preventDefault();
    if (!remarkTarget) return;
    setRemarkError(null);
    setSaving(true);
    try {
      await api.post("/remarks", { criminal_id: remarkTarget.id, description: remarkText });
      setRemarkTarget(null);
      setRemarkText("");
      setNotice(`Remark added for ${remarkTarget.name}.`);
    } catch (err) {
      setRemarkError(err instanceof Error ? err.message : "Could not add remark");
    } finally {
      setSaving(false);
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel="Center" userName={session.name} loginPath="/login/center">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Records</p>
        <h1 className="font-display text-3xl font-bold text-ink">Criminal Records</h1>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <Card padded={false} className="mb-6">
        <form onSubmit={search} className="flex gap-3 p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, mobile, category…"
            className="flex-1 rounded-md border border-ink/15 bg-paper-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stamp/40"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {criminals.map((c) => {
          const photo = uploadUrl(c.image);
          return (
            <Card key={c.id}>
              <div className="flex items-center gap-3">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={c.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-xs text-ink/40">
                    N/A
                  </div>
                )}
                <div>
                  <p className="font-display font-bold text-ink">{c.name}</p>
                  <StampBadge>{c.category}</StampBadge>
                </div>
              </div>
              <dl className="mt-3 space-y-1 text-xs text-ink/60">
                <div>
                  <span className="text-ink/40">Mobile: </span>
                  <span className="font-mono">{c.mobile}</span>
                </div>
                <div>
                  <span className="text-ink/40">Address: </span>
                  {c.address}
                </div>
              </dl>
              <Button
                variant="ghost"
                className="mt-4 w-full"
                onClick={() => {
                  setRemarkTarget(c);
                  setRemarkText("");
                  setRemarkError(null);
                }}
              >
                + Add remark
              </Button>
            </Card>
          );
        })}
        {criminals.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <p className="text-center text-ink/40">No records found.</p>
          </Card>
        )}
      </div>

      <Modal open={!!remarkTarget} onClose={() => setRemarkTarget(null)} title={`Add remark — ${remarkTarget?.name || ""}`}>
        <form onSubmit={submitRemark} className="flex flex-col gap-4">
          {remarkError && <Notice kind="error">{remarkError}</Notice>}
          <TextArea
            label="Remark"
            required
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="What did you observe or find?"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setRemarkTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save remark
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
