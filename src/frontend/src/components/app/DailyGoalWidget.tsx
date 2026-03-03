import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target } from "lucide-react";
import { useState } from "react";
import {
  addFocusMinutes as _addFocusMinutes,
  getDailyGoalMinutes,
  getTodayFocusMinutes,
  saveDailyGoalMinutes,
} from "../../lib/localStorage";

// Re-export so PomodoroTimer can import from here
export { addFocusMinutes } from "../../lib/localStorage";

export function DailyGoalWidget() {
  const [goal, setGoal] = useState(() => getDailyGoalMinutes());
  const [focused, setFocused] = useState(() => getTodayFocusMinutes());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(goal));

  const pct = Math.min(100, Math.round((focused / goal) * 100));

  const handleGoalSave = () => {
    const val = Number.parseInt(draft, 10);
    if (!Number.isNaN(val) && val > 0) {
      setGoal(val);
      saveDailyGoalMinutes(val);
    }
    setEditing(false);
  };

  // Refresh focused minutes on mount each render
  const refreshed = getTodayFocusMinutes();
  if (refreshed !== focused) setFocused(refreshed);

  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <Card
      className="shadow-card border-0 bg-sage-pale widget-accent-sage"
      data-ocid="dashboard.goal.card"
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-sage" />
          Daily Focus Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="flex items-center gap-4">
          {/* Circular progress */}
          <div className="relative w-16 h-16 shrink-0">
            <svg
              width="64"
              height="64"
              className="rotate-[-90deg]"
              aria-label="Focus progress"
              role="img"
            >
              <title>Focus progress: {pct}%</title>
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke="oklch(var(--sage-light))"
                strokeWidth="5"
              />
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke="oklch(var(--sage))"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-bold text-xs text-sage">
                {pct}%
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-xl text-foreground">
              {focused}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {goal} min
              </span>
            </p>
            <p className="text-xs text-muted-foreground">today's focus</p>
            {editing ? (
              <div className="flex items-center gap-1 mt-1.5">
                <Input
                  data-ocid="dashboard.goal.input"
                  type="number"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={handleGoalSave}
                  onKeyDown={(e) => e.key === "Enter" && handleGoalSave()}
                  className="h-6 text-xs rounded-lg px-2 w-20"
                  autoFocus
                  min={5}
                  max={480}
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="dashboard.goal.edit_button"
                onClick={() => {
                  setDraft(String(goal));
                  setEditing(true);
                }}
                className="text-xs text-sage underline underline-offset-2 mt-1 hover:text-sage/70 transition-colors"
              >
                Change goal
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
