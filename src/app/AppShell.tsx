import { BarChart3, CalendarDays, CheckSquare, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { ActiveChallengeState } from "../domain/types";

export function AppShell({ state }: { state: ActiveChallengeState }) {
  return (
    <div className="min-h-dvh bg-background pb-24 text-primary">
      <header className="fixed inset-x-0 top-0 z-30 border-b-2 border-primary bg-background">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5">
          <div>
            <p className="label-caps text-muted">im (75) hard</p>
            <h1 className="font-mono text-xl font-extrabold uppercase">Day {state.today.day.dayNumber} / 75</h1>
          </div>
          <NavLink aria-label="Settings" className="focus-ring grid h-10 w-10 place-items-center border border-primary" to="/settings">
            <Settings size={20} />
          </NavLink>
        </div>
      </header>
      <div className="mx-auto max-w-lg pt-14">
        <Outlet />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-primary bg-background">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
          <Tab to="/today" icon={<CheckSquare size={20} />} label="Today" />
          <Tab to="/timeline" icon={<CalendarDays size={20} />} label="Timeline" />
          <Tab to="/stats" icon={<BarChart3 size={20} />} label="Stats" />
        </div>
      </nav>
    </div>
  );
}

function Tab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `focus-ring flex flex-col items-center justify-center gap-1 label-caps ${isActive ? "bg-primary text-background" : "text-primary"}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
