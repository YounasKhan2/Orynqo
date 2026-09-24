export function MutationStateLabel({ phase }: { phase: string }) {
  if (phase === "idle" || phase === "settled") return null;
  const emphasis =
    phase === "conflict" || phase === "failure" ? "font-bold" : "";
  return (
    <span
      className={`inline-flex min-h-5 items-center rounded-full border border-[var(--border-subtle)] px-1.5 text-[9px] font-semibold capitalize ${phase === "pending" ? "border-dashed" : ""} ${emphasis}`}
      role="status"
    >
      {phase === "pending"
        ? "Pending"
        : phase === "offline"
          ? "Offline · unacknowledged"
          : phase}
    </span>
  );
}
