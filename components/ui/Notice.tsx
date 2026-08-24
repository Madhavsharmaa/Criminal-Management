export default function Notice({
  kind = "error",
  children,
}: {
  kind?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "bg-stamp-light text-stamp-dark border-stamp/30",
    success: "bg-ok-light text-ok border-ok/30",
    info: "bg-brass-light text-brass-dark border-brass/30",
  }[kind];

  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-medium ${styles}`} role="status">
      {children}
    </div>
  );
}
