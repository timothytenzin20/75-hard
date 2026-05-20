export function RatingControl({
  label,
  value,
  lowLabel,
  highLabel,
  onChange
}: {
  label: string;
  value?: number;
  lowLabel?: string;
  highLabel?: string;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="label-caps text-muted">{label}</span>
        <button className="label-caps text-orange" type="button" onClick={() => onChange(undefined)}>
          Clear
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            className={`focus-ring h-11 border-2 font-mono font-bold ${value === rating ? "border-orange bg-orange text-background" : "border-primary text-primary"}`}
            type="button"
            onClick={() => onChange(rating)}
          >
            {rating}
          </button>
        ))}
      </div>
      {(lowLabel || highLabel) ? (
        <div className="mt-2 grid grid-cols-5 gap-2 text-[11px] leading-4 text-muted">
          <span className="col-span-2">{lowLabel}</span>
          <span aria-hidden="true" />
          <span className="col-span-2 text-right">{highLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
