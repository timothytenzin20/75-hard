export function RatingControl({ label, value, onChange }: { label: string; value?: number; onChange: (value: number | undefined) => void }) {
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
    </div>
  );
}
