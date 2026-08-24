export default function StampBadge({
  children,
  tone = "stamp",
}: {
  children: React.ReactNode;
  tone?: "stamp" | "brass" | "ok";
}) {
  const color = {
    stamp: "text-stamp",
    brass: "text-brass-dark",
    ok: "text-ok",
  }[tone];

  return <span className={`stamp-badge text-[0.65rem] font-semibold ${color}`}>{children}</span>;
}
