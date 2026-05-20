import { ArrowLeft, Copy, Download, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { statsFor } from "../../domain/metrics";
import type { ActiveChallengeState, DayRecord } from "../../domain/types";
import { storedImageUrl } from "../../storage/images";
import { getDayRecord, getStatsInputs } from "../../storage/repository";

export function RecapPage({ state }: { state: ActiveChallengeState }) {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const day = state.days.find((item) => item.dayNumber === Number(dayNumber));
  const [record, setRecord] = useState<DayRecord>();
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [includePhoto, setIncludePhoto] = useState(true);
  const [status, setStatus] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!day) return;
    void getDayRecord(day.id).then(setRecord);
    void getStatsInputs(state.challenge.id).then(({ days, journals, photos }) => setStreak(statsFor(state.challenge, days, journals, photos).currentStreak));
  }, [day, state.challenge]);

  useEffect(() => {
    let disposed = false;
    void (async () => {
      const url = await storedImageUrl(record?.photo?.imageDataUrl, record?.photo?.imageBlob);
      if (disposed) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      setPhotoUrl(url);
    })();
    return () => {
      disposed = true;
    };
  }, [record?.photo]);

  const recapText = useMemo(() => (record ? buildRecapText(record, streak) : ""), [record, streak]);

  useEffect(() => {
    if (record) void drawCard(canvasRef.current, record, streak, includePhoto ? photoUrl : undefined);
  }, [record, streak, includePhoto, photoUrl]);

  if (!day || !record) return <main className="px-5 py-8 label-caps text-muted">Loading recap</main>;

  return (
    <main className="space-y-6 px-5 py-8">
      <button className="focus-ring flex items-center gap-2 label-caps text-muted" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Back
      </button>
      <section className="hard-card p-5">
        <p className="label-caps text-orange">Share recap</p>
        <h1 className="font-mono text-4xl font-extrabold uppercase">Day {record.day.dayNumber} complete</h1>
      </section>
      {photoUrl ? <img className="aspect-square w-full border-2 border-primary object-cover" src={photoUrl} alt="Proof preview" /> : null}
      <button
        className={`focus-ring flex min-h-14 w-full items-center justify-between border-2 px-4 label-caps ${
          includePhoto && photoUrl ? "border-orange bg-orange text-background" : "border-primary text-primary"
        } ${photoUrl ? "" : "opacity-50"}`}
        type="button"
        disabled={!photoUrl}
        onClick={() => setIncludePhoto((current) => !current)}
      >
        <span>Include uploaded image</span>
        <span>{includePhoto && photoUrl ? "On" : "Off"}</span>
      </button>
      <canvas ref={canvasRef} className="w-full border-2 border-primary bg-background" width={1080} height={1080} />
      <div className="grid grid-cols-1 gap-3">
        <button className="focus-ring flex items-center justify-center gap-3 bg-primary py-4 label-caps text-background" onClick={() => void shareImage(canvasRef.current, recapText, setStatus)}>
          <Share2 size={18} />
          Share image
        </button>
        <button className="focus-ring flex items-center justify-center gap-3 border-2 border-primary py-4 label-caps" onClick={() => void navigator.clipboard.writeText(recapText).then(() => setStatus("Text copied"))}>
          <Copy size={18} />
          Copy text
        </button>
        <button className="focus-ring flex items-center justify-center gap-3 border-2 border-primary py-4 label-caps" onClick={() => downloadCanvas(canvasRef.current)}>
          <Download size={18} />
          Download image
        </button>
      </div>
      {status ? <p className="label-caps text-orange">{status}</p> : null}
    </main>
  );
}

function buildRecapText(record: DayRecord, streak: number): string {
  const lines = [
    `75 Hard - Day ${record.day.dayNumber} Complete`,
    "",
    "Checklist:",
    ...record.tasks.map((task) => `${task.completed ? "✓" : "□"} ${task.label}`),
    "",
    record.journal?.moodRating ? `Mood: ${record.journal.moodRating}/5` : undefined,
    record.journal?.energyRating ? `Energy: ${record.journal.energyRating}/5` : undefined,
    record.journal?.difficultyRating ? `Difficulty: ${record.journal.difficultyRating}/5` : undefined,
    record.journal?.text ? `"${record.journal.text.slice(0, 160)}${record.journal.text.length > 160 ? "..." : ""}"` : undefined,
    "",
    `Current streak: ${streak} day${streak === 1 ? "" : "s"}`,
    "Logged privately with im hard."
  ];
  return lines.filter(Boolean).join("\n");
}

async function drawCard(canvas: HTMLCanvasElement | null, record: DayRecord, streak: number, photoUrl?: string) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const colors = getCanvasThemeColors();
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
  ctx.fillStyle = colors.accent;
  ctx.font = "700 42px JetBrains Mono, monospace";
  ctx.fillText("IM HARD", 80, 125);
  ctx.fillStyle = colors.primary;
  ctx.font = "800 92px JetBrains Mono, monospace";
  ctx.fillText(`DAY ${record.day.dayNumber}`, 80, 240);
  ctx.font = "700 42px JetBrains Mono, monospace";
  ctx.fillText("COMPLETE", 80, 300);
  if (photoUrl) {
    try {
      const image = await loadImage(photoUrl);
      drawCoverImage(ctx, image, 710, 105, 250, 250);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 6;
      ctx.strokeRect(710, 105, 250, 250);
    } catch {
      // If the browser cannot decode the local blob, keep the recap usable without the image.
    }
  }
  ctx.font = "500 34px Inter, sans-serif";
  record.tasks.slice(0, 8).forEach((task, index) => {
    const x = index < 4 ? 80 : 560;
    const y = 410 + (index % 4) * 78;
    ctx.fillStyle = task.completed ? colors.success : colors.muted;
    ctx.fillText(task.completed ? "✓" : "□", x, y);
    ctx.fillStyle = colors.primary;
    ctx.fillText(task.label, x + 48, y);
  });
  ctx.fillStyle = colors.accent;
  ctx.font = "800 54px JetBrains Mono, monospace";
  ctx.fillText(`${streak} DAY STREAK`, 80, 820);
  ctx.fillStyle = colors.muted;
  ctx.font = "400 32px Inter, sans-serif";
  const quote = record.journal?.text ? record.journal.text.slice(0, 92) : "Private proof, saved locally.";
  ctx.fillText(`"${quote}${record.journal && record.journal.text.length > 92 ? "..." : ""}"`, 80, 895, 920);
  ctx.fillStyle = colors.primary;
  ctx.font = "700 28px JetBrains Mono, monospace";
  ctx.fillText(new Date(record.day.completedAt ?? record.day.updatedAt).toLocaleString(), 80, 990);
}

function getCanvasThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  const color = (token: string) => `rgb(${styles.getPropertyValue(token).trim()})`;
  return {
    background: color("--color-background"),
    primary: color("--color-primary"),
    muted: color("--color-muted"),
    accent: color("--color-accent"),
    success: color("--color-success")
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

async function shareImage(canvas: HTMLCanvasElement | null, text: string, setStatus: (value: string) => void) {
  if (!canvas) return;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const file = new File([blob], "im-hard-recap.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: "im hard recap", text, files: [file] });
    setStatus("Shared");
    return;
  }
  await navigator.clipboard.writeText(text);
  downloadBlob(blob);
  setStatus("Image downloaded and text copied");
}

function downloadCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob);
  }, "image/png");
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "im-hard-recap.png";
  a.click();
  URL.revokeObjectURL(url);
}
