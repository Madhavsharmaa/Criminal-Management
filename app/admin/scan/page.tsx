"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import StampBadge from "@/components/ui/StampBadge";
import WebcamCapture from "@/components/WebcamCapture";
import { useRequireAuth } from "@/lib/useAuth";
import { api, uploadUrl } from "@/lib/api";
import type { Criminal } from "@/lib/types";

const ADMIN_NAV = [
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

interface RecognizeResult {
  matched: boolean;
  confidence: number;
  criminal?: Criminal;
}

export default function FaceScanPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [result, setResult] = useState<RecognizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFrame(frames: string[]) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<RecognizeResult>("/criminals/recognize", { image_base64: frames[0] });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recognition failed");
    } finally {
      setBusy(false);
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={ADMIN_NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Field Tool</p>
        <h1 className="font-display text-3xl font-bold text-ink">Face Scan</h1>
        <p className="mt-1 text-sm text-ink/60">
          Point the camera at a face and capture a frame to check it against trained criminal records.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <WebcamCapture onCapture={handleFrame} captureLabel="Scan this frame" />
        </Card>

        <Card>
          <h2 className="case-label mb-4 text-brass-dark">Result</h2>
          {busy && <p className="text-sm text-ink/50">Checking against trained faces…</p>}
          {error && <Notice kind="error">{error}</Notice>}
          {!busy && !error && !result && <p className="text-sm text-ink/40">Capture a frame to see a match here.</p>}

          {result && !result.matched && (
            <Notice kind="info">
              No confident match found (confidence {result.confidence}). Make sure the model has been trained and
              the face is clearly visible.
            </Notice>
          )}

          {result?.matched && result.criminal && (
            <div className="flex items-center gap-4">
              {uploadUrl(result.criminal.image) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadUrl(result.criminal.image)!}
                  alt={result.criminal.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/10 text-xs text-ink/40">
                  N/A
                </div>
              )}
              <div>
                <p className="font-display text-lg font-bold text-ink">{result.criminal.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StampBadge>{result.criminal.category}</StampBadge>
                  <span className="text-xs text-ink/40">{result.confidence}% confidence</span>
                </div>
                <Link
                  href={`/admin/criminals/${result.criminal.id}`}
                  className="mt-2 inline-block text-sm font-semibold text-stamp hover:underline"
                >
                  View full record →
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
