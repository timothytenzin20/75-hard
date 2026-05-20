import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import { DayDetailPage } from "../features/day-detail/DayDetailPage";
import { OnboardingPage } from "../features/onboarding/OnboardingPage";
import { RecapPage } from "../features/recap/RecapPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { StatsPage } from "../features/stats/StatsPage";
import { TimelinePage } from "../features/timeline/TimelinePage";
import { TodayPage } from "../features/today/TodayPage";
import type { ActiveChallengeState, AppSettings } from "../domain/types";
import { getActiveChallenge, getSettings } from "../storage/repository";

export function App() {
  const [settings, setSettings] = useState<AppSettings>();
  const [state, setState] = useState<ActiveChallengeState>();
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [nextSettings, challenge] = await Promise.all([getSettings(), getActiveChallenge()]);
    setSettings(nextSettings);
    setState(challenge);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  if (loading) {
    return <div className="min-h-dvh grid place-items-center label-caps text-muted">Loading local log</div>;
  }

  if (!settings?.onboardingComplete || !state) {
    return <OnboardingPage onReady={refresh} />;
  }

  return (
    <Routes>
      <Route element={<AppShell state={state} />}>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayPage state={state} onChange={refresh} />} />
        <Route path="/timeline" element={<TimelinePage state={state} />} />
        <Route path="/day/:dayNumber" element={<DayDetailPage state={state} onChange={refresh} />} />
        <Route path="/stats" element={<StatsPage state={state} />} />
        <Route path="/recap/:dayNumber" element={<RecapPage state={state} />} />
        <Route path="/settings" element={<SettingsPage state={state} onChange={refresh} />} />
        <Route path="*" element={<MissingRoute />} />
      </Route>
    </Routes>
  );
}

function MissingRoute() {
  const navigate = useNavigate();
  return (
    <main className="px-5 py-24">
      <div className="hard-card p-6 space-y-4">
        <h1 className="font-mono text-3xl font-extrabold uppercase">Not found</h1>
        <button className="w-full bg-primary text-background py-4 label-caps" onClick={() => navigate("/today")}>
          Return today
        </button>
      </div>
    </main>
  );
}
