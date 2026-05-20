import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CHALLENGE_LENGTH } from "../../domain/constants";
import { addDays, toDateKey } from "../../domain/dates";
import { applyTheme, getDefaultCustomTheme, THEMES } from "../../domain/themes";
import type { ActiveChallengeState, AppSettings, ThemeColors, ThemeId } from "../../domain/types";
import { restartChallenge, setChallengeCurrentDay, updateCustomTheme, updateTheme } from "../../storage/repository";

export function SettingsPage({ state, settings, onChange }: { state: ActiveChallengeState; settings: AppSettings; onChange: () => Promise<void> }) {
  const navigate = useNavigate();
  const activeTheme = settings.theme;
  const customTheme = settings.customTheme ?? getDefaultCustomTheme();
  const [currentDayInput, setCurrentDayInput] = useState(state.today.day.dayNumber);
  const previewStartDate = addDays(toDateKey(new Date()), -(Math.min(Math.max(currentDayInput, 1), CHALLENGE_LENGTH) - 1));
  const previewEndDate = addDays(previewStartDate, CHALLENGE_LENGTH - 1);

  const handleThemeChange = async (theme: ThemeId) => {
    applyTheme(theme, customTheme);
    await updateTheme(theme);
    await onChange();
  };

  const handleCustomColorChange = async (key: keyof ThemeColors, value: string) => {
    const nextTheme = { ...customTheme, [key]: value };
    applyTheme("custom", nextTheme);
    await updateCustomTheme(nextTheme);
    await onChange();
  };

  return (
    <main className="space-y-8 px-5 py-8">
      <section className="hard-card p-5">
        <p className="label-caps text-orange">Settings</p>
        <h1 className="font-mono text-4xl font-extrabold uppercase">Local log</h1>
        <p className="mt-4 leading-7 text-muted">
          Your progress is stored only in this browser on this device. Nothing is uploaded to a server. Clearing browser data may remove your progress.
        </p>
      </section>
      <section className="space-y-4">
        <div>
          <p className="label-caps text-orange">Theme</p>
          <h2 className="font-mono text-3xl font-extrabold uppercase">Color system</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Choose a local theme. It updates the interface and persists on this device.</p>
        </div>
        <div className="space-y-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={`focus-ring w-full border-2 p-4 text-left transition-colors ${activeTheme === theme.id ? "border-orange bg-surface-strong" : "border-primary bg-surface"}`}
              type="button"
              onClick={() => void handleThemeChange(theme.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex gap-1 pt-1" aria-hidden="true">
                  <Swatch color={theme.colors.background} />
                  <Swatch color={theme.colors.primary} />
                  <Swatch color={theme.colors.surface} />
                  <Swatch color={theme.colors.secondary} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-lg font-extrabold uppercase">{theme.name}</p>
                      <p className="label-caps text-muted">{theme.subtitle}</p>
                    </div>
                    {activeTheme === theme.id ? <Check className="shrink-0 text-orange" size={22} /> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{theme.vibe}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className={`border-2 p-4 ${activeTheme === "custom" ? "border-orange bg-surface-strong" : "border-primary bg-surface"}`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-extrabold uppercase">Custom</p>
              <p className="label-caps text-muted">Color wheel</p>
              <p className="mt-2 text-sm leading-6 text-muted">Tune each UI token with your device color picker.</p>
            </div>
            {activeTheme === "custom" ? <Check className="shrink-0 text-orange" size={22} /> : null}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {CUSTOM_COLOR_FIELDS.map((field) => (
              <label key={field.key} className="flex min-h-14 items-center justify-between gap-4 border-b border-outline py-2">
                <span>
                  <span className="label-caps block text-primary">{field.label}</span>
                  <span className="text-xs text-muted">{field.help}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">{customTheme[field.key].toUpperCase()}</span>
                  <input
                    className="square-color-input cursor-pointer border-2 border-primary bg-surface p-0"
                    type="color"
                    value={customTheme[field.key]}
                    onChange={(event) => void handleCustomColorChange(field.key, event.target.value)}
                  />
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>
      <section className="hard-card p-5 space-y-3">
        <p className="label-caps text-muted">Active challenge</p>
        <p>Started {state.challenge.startDate}</p>
        <p>Ends {state.challenge.endDate}</p>
      </section>
      <section className="hard-card space-y-4 p-5">
        <div>
          <p className="label-caps text-orange">Challenge admin</p>
          <h2 className="font-mono text-3xl font-extrabold uppercase">Backfill setup</h2>
          <p className="mt-2 text-sm leading-6 text-muted">If you are starting the app mid-challenge, set which day you are on today. Logs stay attached to their day numbers.</p>
        </div>
        <label className="block">
          <span className="label-caps text-muted">I am on day</span>
          <input
            className="focus-ring mt-2 w-full border-2 border-primary bg-background p-4 font-mono text-3xl font-extrabold text-primary"
            min={1}
            max={CHALLENGE_LENGTH}
            type="number"
            value={currentDayInput}
            onChange={(event) => setCurrentDayInput(Number(event.target.value))}
          />
        </label>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-outline p-3">
            <p className="label-caps text-muted">Start date</p>
            <p className="font-mono font-bold">{previewStartDate}</p>
          </div>
          <div className="border border-outline p-3">
            <p className="label-caps text-muted">End date</p>
            <p className="font-mono font-bold">{previewEndDate}</p>
          </div>
        </div>
        <button
          className="focus-ring w-full bg-primary py-4 label-caps text-background"
          onClick={async () => {
            await setChallengeCurrentDay(state.challenge.id, currentDayInput);
            await onChange();
            navigate("/today");
          }}
        >
          Save challenge day
        </button>
      </section>
      <button
        className="focus-ring flex w-full items-center justify-center gap-3 bg-danger py-5 label-caps text-primary"
        onClick={async () => {
          await restartChallenge(state.today.day.dayNumber);
          await onChange();
          navigate("/today");
        }}
      >
        <RotateCcw size={18} />
        Restart from day 1
      </button>
    </main>
  );
}

const CUSTOM_COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string; help: string }> = [
  { key: "background", label: "Background", help: "Main page color" },
  { key: "surface", label: "Surface", help: "Cards and panels" },
  { key: "surfaceStrong", label: "Surface strong", help: "Selected panels" },
  { key: "primary", label: "Primary", help: "Text and main borders" },
  { key: "muted", label: "Muted", help: "Secondary text" },
  { key: "outline", label: "Outline", help: "Subtle dividers" },
  { key: "accent", label: "Accent", help: "Progress bars and active controls" },
  { key: "secondary", label: "Secondary", help: "Water and alternate accents" },
  { key: "success", label: "Success", help: "Completed ticks" },
  { key: "danger", label: "Danger", help: "Missed or restart states" }
];

function Swatch({ color }: { color: string }) {
  return <span className="block h-7 w-4 border border-primary" style={{ backgroundColor: color }} />;
}
