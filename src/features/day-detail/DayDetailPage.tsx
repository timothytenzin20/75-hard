import { ArrowLeft, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatShortDate } from "../../domain/dates";
import { getDayStatus } from "../../domain/metrics";
import type { ActiveChallengeState, DayRecord } from "../../domain/types";
import { blobUrl } from "../../storage/images";
import { getDayRecord } from "../../storage/repository";

export function DayDetailPage({ state }: { state: ActiveChallengeState; onChange: () => Promise<void> }) {
  const params = useParams();
  const navigate = useNavigate();
  const day = state.days.find((item) => item.dayNumber === Number(params.dayNumber));
  const [record, setRecord] = useState<DayRecord>();
  const [photoUrl, setPhotoUrl] = useState<string>();

  useEffect(() => {
    if (!day) return;
    void getDayRecord(day.id).then(setRecord);
  }, [day]);

  useEffect(() => {
    const url = blobUrl(record?.photo?.imageBlob);
    setPhotoUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [record?.photo]);

  if (!day || !record) {
    return (
      <main className="px-5 py-8">
        <button className="label-caps text-orange" onClick={() => navigate("/timeline")}>Back</button>
      </main>
    );
  }

  const status = getDayStatus(day, state.challenge);

  return (
    <main className="space-y-8 px-5 py-8">
      <button className="focus-ring flex items-center gap-2 label-caps text-muted" onClick={() => navigate("/timeline")}>
        <ArrowLeft size={18} />
        Timeline
      </button>
      <section className="hard-card p-5">
        <p className="label-caps text-orange">{formatShortDate(day.date)}</p>
        <h1 className="font-mono text-4xl font-extrabold uppercase">Day {day.dayNumber}</h1>
        <p className="label-caps mt-2 text-muted">Status: {status.replace("_", " ")}</p>
      </section>
      <section className="aspect-[4/5] overflow-hidden border-2 border-primary bg-surface">
        {photoUrl ? <img className="h-full w-full object-cover" src={photoUrl} alt={`Day ${day.dayNumber} proof`} /> : <div className="grid h-full place-items-center label-caps text-muted">No photo</div>}
      </section>
      <section>
        <h2 className="label-caps mb-3 text-muted">Checklist results</h2>
        <div className="border-t border-primary">
          {record.tasks.map((task) => (
            <div key={task.id} className="flex min-h-14 items-center justify-between border-b border-primary">
              <span className={task.completed ? "text-muted line-through" : "text-primary"}>{task.label}</span>
              <span className={`label-caps ${task.completed ? "text-success" : "text-muted"}`}>{task.completed ? "Done" : "Open"}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="hard-card p-5">
        <h2 className="label-caps mb-3 text-muted">Journal</h2>
        <p className="leading-7">{record.journal?.text || "No journal entry for this day."}</p>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <MiniStat label="Mood" value={record.journal?.moodRating ?? "-"} />
          <MiniStat label="Energy" value={record.journal?.energyRating ?? "-"} />
          <MiniStat label="Hard" value={record.journal?.difficultyRating ?? "-"} />
        </div>
      </section>
      {status === "complete" ? (
        <Link className="focus-ring flex w-full items-center justify-center gap-3 bg-primary py-5 label-caps text-background shadow-hard" to={`/recap/${day.dayNumber}`}>
          <Share2 size={18} />
          Share proof
        </Link>
      ) : null}
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-primary p-3">
      <p className="label-caps text-muted">{label}</p>
      <p className="font-mono text-2xl font-extrabold">{value}</p>
    </div>
  );
}
