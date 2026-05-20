import { Check, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { applyTheme, THEMES } from "../../domain/themes";
import type { ActiveChallengeState, AppSettings, ThemeId } from "../../domain/types";
import { restartChallenge, updateTheme } from "../../storage/repository";

export function SettingsPage({ state, settings, onChange }: { state: ActiveChallengeState; settings: AppSettings; onChange: () => Promise<void> }) {
  const navigate = useNavigate();
  const activeTheme = settings.theme;

  const handleThemeChange = async (theme: ThemeId) => {
    applyTheme(theme);
    await updateTheme(theme);
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
      </section>
      <section className="hard-card p-5 space-y-3">
        <p className="label-caps text-muted">Active challenge</p>
        <p>Started {state.challenge.startDate}</p>
        <p>Ends {state.challenge.endDate}</p>
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

function Swatch({ color }: { color: string }) {
  return <span className="block h-7 w-4 border border-primary" style={{ backgroundColor: color }} />;
}
