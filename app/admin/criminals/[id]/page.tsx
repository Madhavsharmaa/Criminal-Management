"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import StampBadge from "@/components/ui/StampBadge";
import WebcamCapture from "@/components/WebcamCapture";
import { useRequireAuth } from "@/lib/useAuth";
import { api, uploadUrl } from "@/lib/api";
import type { Criminal } from "@/lib/types";

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

export default function CriminalDetailPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [criminal, setCriminal] = useState<Criminal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [training, setTraining] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  async function load() {
    try {
      const c = await api.get<Criminal>(`/criminals/${params.id}`);
      setCriminal(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load record");
    }
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleFrames(frames: string[]) {
    setCapturing(true);
    setError(null);
    try {
      const res = await api.post<{ saved: number; total: number }>(`/criminals/${params.id}/capture`, {
        images_base64: frames,
      });
      setNotice(`Captured ${res.saved} usable photo(s). Dataset now has ${res.total}.`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Capture failed");
    } finally {
      setCapturing(false);
    }
  }

  async function handleTrain() {
    setTraining(true);
    setError(null);
    setNotice(null);
    try {
      const res = await api.post<{ trained_people: number; trained_images: number }>("/criminals/train");
      setNotice(`Model retrained on ${res.trained_images} photos across ${res.trained_people} people.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Training failed");
    } finally {
      setTraining(false);
    }
  }

  if (!session) return null;
  if (!criminal) {
    return (
      <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
        {error ? <Notice kind="error">{error}</Notice> : <p className="text-ink/40">Loading…</p>}
      </AppShell>
    );
  }

  const photo = uploadUrl(criminal.image);

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <Link href="/admin/criminals" className="text-sm text-ink/50 hover:underline">
        ← Back to records
      </Link>

      <header className="mt-4 mb-6 flex items-center gap-5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={criminal.name} className="h-20 w-20 rounded-full border-2 border-ink/10 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink/10 text-xs text-ink/40">
            No photo
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">{criminal.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StampBadge>{criminal.category}</StampBadge>
            <span className="font-mono text-xs text-ink/40">Case #{criminal.id}</span>
          </div>
        </div>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="case-label mb-4 text-brass-dark">Details</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-ink/40">Gender</dt>
            <dd className="text-ink">{criminal.gender}</dd>
            <dt className="text-ink/40">Date of birth</dt>
            <dd className="text-ink">{criminal.dob}</dd>
            <dt className="text-ink/40">Mobile</dt>
            <dd className="font-mono text-ink">{criminal.mobile}</dd>
            <dt className="text-ink/40">Address</dt>
            <dd className="text-ink">{criminal.address}</dd>
            <dt className="text-ink/40">Family member</dt>
            <dd className="text-ink">
              {criminal.family_member} {criminal.relation_type && `(${criminal.relation_type})`}
            </dd>
            <dt className="text-ink/40">Member contact</dt>
            <dd className="font-mono text-ink">{criminal.member_contact}</dd>
          </dl>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="case-label text-brass-dark">Face ID Dataset</h2>
            <span className="text-sm text-ink/50">{criminal.dataset_count} photo(s) captured</span>
          </div>
          <p className="mb-4 text-sm text-ink/60">
            Capture several webcam photos of this person from slightly different angles, then retrain the
            recognition model. The scan page can then match a live camera feed against this record.
          </p>

          {!showCamera ? (
            <Button variant="secondary" onClick={() => setShowCamera(true)}>
              Open camera
            </Button>
          ) : (
            <WebcamCapture onCapture={handleFrames} burstCount={5} captureLabel="Capture 5 frames" />
          )}

          <div className="mt-5 border-t border-ink/10 pt-5">
            <Button variant="ghost" onClick={handleTrain} loading={training || capturing} className="w-full">
              Retrain recognition model
            </Button>
            <p className="mt-2 text-xs text-ink/40">
              Retrains across every criminal&apos;s dataset. Run this after capturing new photos for anyone.
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
