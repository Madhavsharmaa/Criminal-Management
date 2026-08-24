"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { TextArea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Remark } from "@/lib/types";

const NAV = [
  { href: "/center/dashboard", label: "Dashboard" },
  { href: "/center/criminals", label: "Criminal Records" },
  { href: "/center/remarks", label: "My Remarks" },
  { href: "/center/change-password", label: "Change Password" },
];

export default function CenterRemarksPage() {
  const session = useRequireAuth(["Center"], "/login/center");
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const rows = await api.get<Remark[]>("/remarks");
      setRemarks(rows.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load remarks");
    }
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function startEdit(r: Remark) {
    setEditingId(r.id);
    setEditText(r.description);
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (editingId === null) return;
    setSaving(true);
    try {
      await api.put(`/remarks/${editingId}`, { description: editText });
      setEditingId(null);
      setNotice("Remark updated.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update remark");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this remark?")) return;
    try {
      await api.delete(`/remarks/${id}`);
      setNotice("Remark deleted.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete remark");
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel="Center" userName={session.name} loginPath="/login/center">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Field Notes</p>
        <h1 className="font-display text-3xl font-bold text-ink">My Remarks</h1>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <div className="grid gap-4">
        {remarks.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-display font-bold text-ink">{r.criminal_name}</p>
                <p className="case-label mt-1 text-ink/40">
                  {r.date} · {r.time}
                </p>

                {editingId === r.id ? (
                  <form onSubmit={saveEdit} className="mt-3 flex flex-col gap-3">
                    <TextArea label="Remark" value={editText} onChange={(e) => setEditText(e.target.value)} />
                    <div className="flex gap-2">
                      <Button type="submit" loading={saving}>
                        Save
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-2 text-sm text-ink/70">{r.description}</p>
                )}
              </div>
              {editingId !== r.id && (
                <div className="flex flex-shrink-0 gap-3">
                  <button onClick={() => startEdit(r)} className="text-xs font-semibold text-ink/60 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-xs font-semibold text-stamp hover:underline">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {remarks.length === 0 && (
          <Card>
            <p className="text-center text-ink/40">You haven&apos;t logged any remarks yet.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
