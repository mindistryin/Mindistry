import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjects,
} from "../hooks/useQueries";
import {
  type SubjectHours,
  type TimetableEntry,
  getSubjectHours,
  getTimetable,
  getTimetableStartTime,
  saveSubjectHours,
  saveTimetable,
  saveTimetableStartTime,
} from "../lib/localStorage";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUBJECT_COLORS = [
  "#9B87D5",
  "#87C5A5",
  "#E8A07A",
  "#7AB8D5",
  "#D57A87",
  "#A0C87A",
  "#D5B87A",
  "#87A0D5",
  "#C87AA0",
  "#7AD5C8",
];

function generateTimeSlots(
  startTime: string,
  hoursMap: Map<string, number>,
): string[] {
  const [startH, startM] = startTime.split(":").map(Number);
  const maxHoursPerDay = Math.min(
    12,
    Array.from(hoursMap.values()).reduce((a, b) => a + b, 0),
  );
  const slots: string[] = [];
  for (let i = 0; i < maxHoursPerDay; i++) {
    const h = startH + i;
    const end = h + 1;
    const formatH = (n: number) => String(n % 24).padStart(2, "0");
    slots.push(
      `${formatH(h)}:${String(startM).padStart(2, "0")}-${formatH(end)}:${String(startM).padStart(2, "0")}`,
    );
  }
  return slots;
}

function generateTimetable(
  subjects: Array<{ id: string; name: string; color: string }>,
  hoursMap: Map<string, number>,
  startTime: string,
): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  const slots = generateTimeSlots(startTime, hoursMap);

  // Build a pool of subject slots per day
  for (const day of DAYS) {
    const pool: Array<{ id: string; name: string; color: string }> = [];
    for (const sub of subjects) {
      const hours = hoursMap.get(sub.id) ?? 0;
      for (let i = 0; i < hours; i++) pool.push(sub);
    }

    // Distribute evenly across available slots
    const bounded = pool.slice(0, slots.length);
    for (let idx = 0; idx < bounded.length; idx++) {
      const sub = bounded[idx];
      if (idx < slots.length) {
        entries.push({
          day,
          slot: slots[idx],
          subjectId: sub.id,
          subjectName: sub.name,
          color: sub.color,
        });
      }
    }
  }

  return entries;
}

export function TimetablePage() {
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { mutateAsync: createSubject, isPending: isCreating } =
    useCreateSubject();
  const { mutateAsync: deleteSubject } = useDeleteSubject();

  const [hoursMap, setHoursMap] = useState<Map<string, number>>(new Map());
  const [startTime, setStartTime] = useState("08:00");
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getTimetable();
    const storedHours = getSubjectHours();
    const storedStart = getTimetableStartTime();
    setTimetable(stored);
    setStartTime(storedStart);
    const map = new Map<string, number>();
    for (const sh of storedHours) map.set(sh.subjectId, sh.hoursPerDay);
    setHoursMap(map);
  }, []);

  // Sync hours when subjects load
  useEffect(() => {
    const stored = getSubjectHours();
    const map = new Map<string, number>();
    for (const sh of stored) map.set(sh.subjectId, sh.hoursPerDay);
    for (const s of subjects) {
      if (!map.has(s.id)) map.set(s.id, 1);
    }
    setHoursMap(new Map(map));
  }, [subjects]);

  const handleHoursChange = (subjectId: string, hours: number) => {
    setHoursMap((prev) => {
      const next = new Map(prev);
      next.set(subjectId, Math.max(0, Math.min(8, hours)));
      return next;
    });
  };

  const handleGenerate = () => {
    const subjectHours: SubjectHours[] = subjects.map((s) => ({
      subjectId: s.id,
      hoursPerDay: hoursMap.get(s.id) ?? 1,
    }));
    saveSubjectHours(subjectHours);
    saveTimetableStartTime(startTime);

    const generated = generateTimetable(subjects, hoursMap, startTime);
    saveTimetable(generated);
    setTimetable(generated);
    toast.success("Timetable generated!");
  };

  const handleClear = () => {
    saveTimetable([]);
    setTimetable([]);
    toast.success("Timetable cleared");
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await createSubject({
        name: newSubjectName.trim(),
        color: newSubjectColor,
      });
      setNewSubjectName("");
      setNewSubjectColor(
        SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      );
      setShowAddSubject(false);
      toast.success("Subject added!");
    } catch {
      toast.error("Failed to add subject");
    }
  };

  // Build timetable grid
  const timeSlots = useMemo(() => {
    const activeHours = new Map<string, number>();
    for (const s of subjects) {
      const h = hoursMap.get(s.id) ?? 0;
      if (h > 0) activeHours.set(s.id, h);
    }
    if (activeHours.size === 0) return [];
    return generateTimeSlots(startTime, activeHours);
  }, [subjects, hoursMap, startTime]);

  const timetableGrid = useMemo(() => {
    const grid: Record<string, Record<string, TimetableEntry | null>> = {};
    for (const d of DAYS) {
      grid[d] = {};
      for (const s of timeSlots) {
        grid[d][s] = null;
      }
    }
    for (const e of timetable) {
      if (grid[e.day]) grid[e.day][e.slot] = e;
    }
    return grid;
  }, [timetable, timeSlots]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Auto-generate your weekly schedule
          </p>
        </div>
        <Button
          data-ocid="timetable.add_subject.open_modal_button"
          size="sm"
          onClick={() => setShowAddSubject(true)}
          className="bg-sage text-white rounded-xl font-display font-semibold"
        >
          <Plus className="w-4 h-4 mr-1" /> Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-card border-0">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="font-display text-sm">
                Schedule Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-3">
              <div>
                <Label className="text-xs font-medium">Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 rounded-xl h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium mb-2 block">
                  Hours per Subject per Day
                </Label>
                {subjectsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-8 bg-muted rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : subjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add subjects to configure hours.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2"
                        data-ocid="timetable.subject.row"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-xs flex-1 truncate font-medium">
                          {s.name}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          max={8}
                          value={hoursMap.get(s.id) ?? 1}
                          onChange={(e) =>
                            handleHoursChange(
                              s.id,
                              Number.parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-16 h-7 text-xs rounded-lg text-center"
                        />
                        <span className="text-xs text-muted-foreground">h</span>
                        <Button
                          data-ocid="timetable.subject.delete_button"
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            void deleteSubject(s.id).catch(() =>
                              toast.error("Failed to delete subject"),
                            );
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  data-ocid="timetable.generate.primary_button"
                  onClick={handleGenerate}
                  disabled={subjects.length === 0}
                  className="flex-1 bg-lavender text-primary-foreground rounded-xl font-display font-semibold text-xs h-9"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Generate
                </Button>
                {timetable.length > 0 && (
                  <Button
                    data-ocid="timetable.clear.secondary_button"
                    variant="outline"
                    onClick={handleClear}
                    className="rounded-xl text-xs h-9"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid */}
        <div className="lg:col-span-2">
          {timetable.length === 0 ? (
            <div
              data-ocid="timetable.empty_state"
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <span className="text-5xl">📅</span>
              <p className="font-display font-semibold text-muted-foreground">
                No timetable yet
              </p>
              <p className="text-sm text-muted-foreground/60 max-w-xs">
                Add subjects, set hours, and click Generate to create your
                weekly schedule.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-x-auto"
            >
              <div className="min-w-[500px]">
                {/* Day headers */}
                <div
                  className="grid gap-1 mb-1"
                  style={{
                    gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`,
                  }}
                >
                  <div />
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-display font-semibold text-muted-foreground py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Slots */}
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="grid gap-1 mb-1"
                    style={{
                      gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`,
                    }}
                    data-ocid="timetable.row"
                  >
                    <div className="text-xs text-muted-foreground flex items-center pr-2 justify-end">
                      {slot.split("-")[0]}
                    </div>
                    {DAYS.map((day) => {
                      const entry = timetableGrid[day]?.[slot];
                      return (
                        <div
                          key={day}
                          className="h-10 rounded-lg flex items-center justify-center"
                          style={
                            entry
                              ? {
                                  backgroundColor: `${entry.color}25`,
                                  border: `1px solid ${entry.color}50`,
                                }
                              : {
                                  backgroundColor: "oklch(var(--muted))",
                                }
                          }
                        >
                          {entry && (
                            <span
                              className="text-xs font-medium truncate px-1"
                              style={{ color: entry.color }}
                            >
                              {entry.subjectName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Subject Dialog */}
      <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
        <DialogContent
          data-ocid="timetable.add_subject.dialog"
          className="max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs font-medium">Subject Name</Label>
              <Input
                data-ocid="timetable.add_subject.input"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g. Mathematics"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-2 block">Color</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewSubjectColor(c)}
                    className="w-7 h-7 rounded-full transition-all"
                    style={{
                      backgroundColor: c,
                      outline:
                        newSubjectColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button
              data-ocid="timetable.add_subject.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowAddSubject(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="timetable.add_subject.submit_button"
              className="flex-1 bg-sage text-white rounded-xl font-semibold"
              disabled={!newSubjectName.trim() || isCreating}
              onClick={() => {
                void handleAddSubject();
              }}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Add Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
