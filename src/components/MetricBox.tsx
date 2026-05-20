export function MetricBox({ label, value, suffix, accent = false }: { label: string; value: string | number; suffix?: string; accent?: boolean }) {
  return (
    <div className="hard-card flex min-h-32 flex-col justify-between p-4">
      <p className="label-caps text-muted">{label}</p>
      <div>
        <span className={`font-mono text-5xl font-extrabold leading-none ${accent ? "text-orange" : "text-primary"}`}>{value}</span>
        {suffix ? <p className="label-caps mt-1 text-muted">{suffix}</p> : null}
      </div>
    </div>
  );
}
