import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { getWeeklyCompletions } from "../../lib/localStorage";

const DAY_LABELS = ["6d", "5d", "4d", "3d", "2d", "Yesterday", "Today"];

export function ProgressChartWidget() {
  const data = getWeeklyCompletions();
  const maxVal = Math.max(...data, 1);

  return (
    <Card
      className="shadow-card border-0 bg-peach-pale widget-accent-peach"
      data-ocid="dashboard.progress.card"
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-peach" />
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="flex items-end gap-1.5 h-16">
          {data.map((count, i) => {
            const heightPct = (count / maxVal) * 100;
            const isToday = i === 6;
            return (
              <div
                key={DAY_LABELS[i]}
                className="flex-1 flex flex-col items-center gap-1"
                data-ocid={`dashboard.progress.chart_point.${i + 1}`}
              >
                <div className="w-full flex items-end justify-center">
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(4, (heightPct / 100) * 48)}px`,
                      backgroundColor: isToday
                        ? "oklch(var(--peach))"
                        : "oklch(var(--peach-light))",
                    }}
                    title={`${count} task${count !== 1 ? "s" : ""}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {data.map((_, i) => (
            <div key={DAY_LABELS[i]} className="flex-1 text-center">
              <span className="text-[9px] text-muted-foreground leading-none">
                {i === 6 ? "Today" : i === 5 ? "Yest" : `${6 - i}d`}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {data[6]} task{data[6] !== 1 ? "s" : ""} completed today ·{" "}
          {data.reduce((a, b) => a + b, 0)} this week
        </p>
      </CardContent>
    </Card>
  );
}
