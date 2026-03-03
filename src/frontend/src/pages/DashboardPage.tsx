import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Plus,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DailyGoalWidget } from "../components/app/DailyGoalWidget";
import { FocusMusicWidget } from "../components/app/FocusMusicWidget";
import { PomodoroTimer } from "../components/app/PomodoroTimer";
import { ProgressChartWidget } from "../components/app/ProgressChartWidget";
import { QuickNotesPanel } from "../components/app/QuickNotesPanel";
import { QuoteWidget } from "../components/app/QuoteWidget";
import {
  useSubjects,
  useTasks,
  useUpdateTask,
  useUserProfile,
} from "../hooks/useQueries";
import {
  addExam,
  bigIntNsToDate,
  computeStreak,
  daysUntil,
  generateId,
  getExams,
  getLatestAnnouncement,
  recordTaskCompletion,
} from "../lib/localStorage";

function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const ann = useMemo(() => getLatestAnnouncement(), []);
  if (!ann || dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-peach-pale border border-peach-light rounded-xl px-4 py-3 flex items-start justify-between gap-3"
      data-ocid="dashboard.announcement.panel"
    >
      <div>
        <p className="font-display font-semibold text-sm text-foreground">
          {ann.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{ann.content}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
        data-ocid="dashboard.announcement.close_button"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function StreakCard() {
  const streak = useMemo(() => computeStreak(), []);
  return (
    <Card
      className="shadow-card border-0 bg-streak-pale widget-accent-streak"
      data-ocid="dashboard.streak.card"
    >
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-gentle-pulse">🔥</span>
          <div>
            <p className="font-display font-bold text-2xl text-streak">
              {streak}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              day streak
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {streak === 0
            ? "Complete a Pomodoro session to start your streak!"
            : streak === 1
              ? "Great start! Keep it up 💪"
              : `You're on fire! ${streak} days straight 🏆`}
        </p>
      </CardContent>
    </Card>
  );
}

function AddExamDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !date) return;
    addExam({ id: generateId(), name: name.trim(), examDate: date });
    setName("");
    setDate("");
    setOpen(false);
    onAdded();
    toast.success("Exam added!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-ocid="exam.open_modal_button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-lavender hover:bg-lavender-light"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Exam
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="exam.dialog" className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Add Exam Countdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Exam Name</Label>
            <Input
              data-ocid="exam.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics Final"
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs">Exam Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              data-ocid="exam.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="exam.submit_button"
              className="flex-1 bg-lavender text-primary-foreground rounded-xl"
              onClick={handleAdd}
              disabled={!name.trim() || !date}
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExamCountdownCard() {
  const [, forceUpdate] = useState(0);
  const exams = useMemo(() => {
    const e = getExams();
    return e
      .filter((x) => daysUntil(x.examDate) >= 0)
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
  }, []);
  const nearest = exams[0];

  return (
    <Card
      className="shadow-card border-0 bg-sky-pale widget-accent-sky"
      data-ocid="dashboard.exam.card"
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky" />
            Exam Countdown
          </CardTitle>
          <AddExamDialog onAdded={() => forceUpdate((n) => n + 1)} />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {nearest ? (
          <div>
            <p className="font-display font-black text-3xl text-sky leading-none">
              {daysUntil(nearest.examDate)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              days until <strong>{nearest.name}</strong>
            </p>
            {exams.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{exams.length - 1} more exam{exams.length - 1 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        ) : (
          <div
            data-ocid="exam.empty_state"
            className="text-xs text-muted-foreground"
          >
            No upcoming exams. Add one to start counting down!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TodayTasksWidget() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: subjects = [] } = useSubjects();
  const { mutateAsync: updateTask } = useUpdateTask();

  const todayTasks = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      const due = bigIntNsToDate(t.dueDate);
      return !t.completed && due <= cutoff;
    });
  }, [tasks]);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const s of subjects) map.set(s.id, { name: s.name, color: s.color });
    return map;
  }, [subjects]);

  const handleToggle = async (task: (typeof tasks)[0]) => {
    try {
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        subjectId: task.subjectId ?? null,
        dueDate: bigIntNsToDate(task.dueDate),
        priority: task.priority,
        completed: !task.completed,
      });
      if (!task.completed) recordTaskCompletion();
    } catch {
      toast.error("Failed to update task");
    }
  };

  return (
    <Card
      className="shadow-card border-0 widget-accent-lavender"
      data-ocid="dashboard.tasks.card"
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-lavender" />
            Today's Tasks
          </CardTitle>
          <Link to="/planner">
            <Button
              data-ocid="dashboard.tasks.primary_button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-lavender hover:bg-lavender-light"
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {isLoading ? (
          <div data-ocid="dashboard.tasks.loading_state" className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <div
            data-ocid="dashboard.tasks.empty_state"
            className="flex items-center gap-2 text-xs text-muted-foreground py-2"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            No tasks due today. Great job! 🎉
          </div>
        ) : (
          <ul className="space-y-2" data-ocid="dashboard.tasks.list">
            {todayTasks.slice(0, 5).map((task, i) => {
              const subject = task.subjectId
                ? subjectMap.get(task.subjectId)
                : null;
              return (
                <li
                  key={task.id}
                  data-ocid={`dashboard.tasks.item.${i + 1}`}
                  className="flex items-start gap-2.5 py-1"
                >
                  <Checkbox
                    data-ocid={`dashboard.tasks.checkbox.${i + 1}`}
                    checked={task.completed}
                    onCheckedChange={() => {
                      void handleToggle(task);
                    }}
                    className="mt-0.5 data-[state=checked]:bg-lavender data-[state=checked]:border-lavender"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body leading-tight truncate">
                      {task.title}
                    </p>
                    {subject && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${subject.color}30`,
                          color: subject.color,
                        }}
                      >
                        {subject.name}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
            {todayTasks.length > 5 && (
              <li className="text-xs text-muted-foreground">
                +{todayTasks.length - 5} more in{" "}
                <Link to="/planner" className="text-lavender underline">
                  Planner
                </Link>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Quick-nav: redesigned as pill strip ──────────────────────────────────────
const QUICK_LINKS = [
  {
    to: "/planner",
    icon: BookOpen,
    label: "Planner",
    accent: "oklch(var(--lavender))",
    pale: "oklch(var(--lavender-pale))",
  },
  {
    to: "/timetable",
    icon: Calendar,
    label: "Timetable",
    accent: "oklch(var(--sage))",
    pale: "oklch(var(--sage-pale))",
  },
  {
    to: "/research",
    icon: Search,
    label: "Research",
    accent: "oklch(var(--peach))",
    pale: "oklch(var(--peach-pale))",
  },
  {
    to: "/grades",
    icon: GraduationCap,
    label: "Grades",
    accent: "oklch(var(--sky))",
    pale: "oklch(var(--sky-pale))",
  },
] as const;

function QuickNavStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {QUICK_LINKS.map(({ to, icon: Icon, label, accent, pale }) => (
        <Link
          key={to}
          to={to}
          data-ocid={`dashboard.${label.toLowerCase()}.link`}
        >
          <motion.div
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-card cursor-pointer"
            style={{ backgroundColor: pale }}
          >
            {/* Icon bubble */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${accent}22` }}
            >
              <Icon className="w-4 h-4" style={{ color: accent }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-foreground leading-none">
                {label}
              </p>
            </div>

            <ArrowRight
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: accent, opacity: 0.7 }}
            />

            {/* Subtle glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 10% 50%, ${accent}18 0%, transparent 70%)`,
              }}
            />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

// ── Dashboard hero header band ───────────────────────────────────────────────
function DashboardHero({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="dashboard-hero rounded-2xl px-6 pt-6 pb-5 space-y-4 shadow-card"
    >
      {/* Greeting row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-body text-muted-foreground uppercase tracking-widest mb-1">
            {dateStr}
          </p>
          <h1 className="font-display font-black text-3xl text-foreground leading-tight">
            {greeting}, {name} {greetingEmoji}
          </h1>
        </div>
      </div>

      {/* Quote inset */}
      <QuoteWidget />
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { data: profile } = useUserProfile();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Hero header */}
      <DashboardHero name={profile?.name ?? "Student"} />

      {/* Announcement */}
      <AnnouncementBanner />

      {/* Row 2: Pomodoro | DailyGoal | Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card
            className="shadow-card border-0 bg-lavender-pale widget-accent-lavender"
            data-ocid="dashboard.pomodoro.card"
          >
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="font-display text-sm font-semibold">
                Pomodoro Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <PomodoroTimer />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <DailyGoalWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <StreakCard />
        </motion.div>
      </div>

      {/* Row 3: ExamCountdown | ProgressChart | FocusMusic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          <ExamCountdownCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27, duration: 0.4 }}
        >
          <ProgressChartWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
        >
          <FocusMusicWidget />
        </motion.div>
      </div>

      {/* Row 4: Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <TodayTasksWidget />
      </motion.div>

      {/* Row 5: Quick nav strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <QuickNavStrip />
      </motion.div>

      {/* Floating Quick Notes */}
      <QuickNotesPanel />
    </div>
  );
}
