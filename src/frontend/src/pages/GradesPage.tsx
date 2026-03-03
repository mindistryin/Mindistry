import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { GradeAssignment, GradeSubject } from "../lib/localStorage";
import {
  generateId,
  getGradeSubjects,
  saveGradeSubjects,
} from "../lib/localStorage";

// Grade calculation helpers
function calcWeightedAverage(assignments: GradeAssignment[]): number | null {
  if (assignments.length === 0) return null;
  const totalWeight = assignments.reduce((s, a) => s + a.weight, 0);
  if (totalWeight === 0) return null;
  const weightedSum = assignments.reduce((s, a) => s + a.score * a.weight, 0);
  return weightedSum / totalWeight;
}

function scoreToLetterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function letterToGpa(letter: string): number {
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  return map[letter] ?? 0;
}

function gradeColor(letter: string): string {
  return (
    {
      A: "bg-sage-pale text-sage",
      B: "bg-lavender-pale text-lavender",
      C: "bg-peach-pale text-peach",
      D: "bg-sky-pale text-sky",
      F: "bg-destructive/10 text-destructive",
    }[letter] ?? "bg-muted text-muted-foreground"
  );
}

interface AddAssignmentDialogProps {
  subjectId: string;
  onSave: (a: Omit<GradeAssignment, "id">) => void;
}

function AddAssignmentDialog({
  subjectId: _subjectId,
  onSave,
}: AddAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [weight, setWeight] = useState("");

  const handleSave = () => {
    const s = Number.parseFloat(score);
    const w = Number.parseFloat(weight);
    if (!name.trim() || Number.isNaN(s) || Number.isNaN(w)) return;
    onSave({
      name: name.trim(),
      score: Math.min(100, Math.max(0, s)),
      weight: Math.max(0, w),
    });
    setName("");
    setScore("");
    setWeight("");
    setOpen(false);
  };

  const valid =
    name.trim() &&
    score !== "" &&
    weight !== "" &&
    !Number.isNaN(Number(score)) &&
    !Number.isNaN(Number(weight));

  return (
    <>
      <Button
        data-ocid="grades.assignment.open_modal_button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="h-7 text-xs text-peach hover:bg-peach-pale"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add
      </Button>
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent
          data-ocid="grades.assignment.dialog"
          className="max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <div>
              <Label className="text-xs">Assignment Name</Label>
              <Input
                data-ocid="grades.assignment.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midterm Exam"
                className="mt-1 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Score (0–100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="85"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Weight (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="30"
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              data-ocid="grades.assignment.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="grades.assignment.submit_button"
              className="flex-1 rounded-xl bg-peach text-white"
              onClick={handleSave}
              disabled={!valid}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface SubjectCardProps {
  subject: GradeSubject;
  onUpdate: (updated: GradeSubject) => void;
  onDelete: () => void;
  index: number;
}

function SubjectCard({ subject, onUpdate, onDelete, index }: SubjectCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const avg = calcWeightedAverage(subject.assignments);
  const letter = avg !== null ? scoreToLetterGrade(avg) : null;

  const handleAddAssignment = (a: Omit<GradeAssignment, "id">) => {
    const newAssignment: GradeAssignment = { ...a, id: generateId() };
    onUpdate({
      ...subject,
      assignments: [...subject.assignments, newAssignment],
    });
    toast.success("Assignment added");
  };

  const handleDeleteAssignment = (id: string) => {
    onUpdate({
      ...subject,
      assignments: subject.assignments.filter((a) => a.id !== id),
    });
  };

  return (
    <Card
      className="shadow-card border-0"
      data-ocid={`grades.subject.card.${index}`}
    >
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="font-display text-base">
              {subject.name}
            </CardTitle>
            {letter && (
              <Badge
                className={`${gradeColor(letter)} border-0 font-display font-bold px-2.5`}
              >
                {letter}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <AddAssignmentDialog
              subjectId={subject.id}
              onSave={handleAddAssignment}
            />
            <Button
              data-ocid={`grades.subject.delete_button.${index}`}
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {avg !== null && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Weighted average:{" "}
            <span className="font-semibold text-foreground">
              {avg.toFixed(1)}%
            </span>
          </p>
        )}
      </CardHeader>

      {subject.assignments.length > 0 ? (
        <CardContent className="px-5 pb-4">
          <div className="space-y-1.5">
            {subject.assignments.map((a, ai) => {
              const aLetter = scoreToLetterGrade(a.score);
              return (
                <div
                  key={a.id}
                  data-ocid={`grades.assignment.item.${ai + 1}`}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body truncate">{a.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {a.score}% · {a.weight}w
                    </span>
                    <Badge
                      className={`${gradeColor(aLetter)} border-0 text-xs font-bold px-2`}
                    >
                      {aLetter}
                    </Badge>
                    <button
                      type="button"
                      data-ocid={`grades.assignment.delete_button.${ai + 1}`}
                      onClick={() => handleDeleteAssignment(a.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      ) : (
        <CardContent className="px-5 pb-4">
          <p
            data-ocid={`grades.assignment.empty_state.${index}`}
            className="text-xs text-muted-foreground text-center py-3"
          >
            No assignments yet. Add one to track your grade.
          </p>
        </CardContent>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          data-ocid="grades.subject.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete {subject.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All assignments for this subject will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="grades.subject.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="grades.subject.delete.confirm_button"
              onClick={onDelete}
              className="rounded-xl bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function GradesPage() {
  const [subjects, setSubjects] = useState<GradeSubject[]>(() =>
    getGradeSubjects(),
  );
  const [newSubjectName, setNewSubjectName] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const persist = (updated: GradeSubject[]) => {
    setSubjects(updated);
    saveGradeSubjects(updated);
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const newSubject: GradeSubject = {
      id: generateId(),
      name: newSubjectName.trim(),
      assignments: [],
    };
    persist([...subjects, newSubject]);
    setNewSubjectName("");
    setAddOpen(false);
    toast.success("Subject added!");
  };

  const handleUpdateSubject = (updated: GradeSubject) => {
    persist(subjects.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (id: string) => {
    persist(subjects.filter((s) => s.id !== id));
    toast.success("Subject removed");
  };

  // Overall GPA calculation
  const overallGpa = useMemo(() => {
    const subjectsWithGrades = subjects.filter(
      (s) => calcWeightedAverage(s.assignments) !== null,
    );
    if (subjectsWithGrades.length === 0) return null;
    const totalGpa = subjectsWithGrades.reduce((sum, s) => {
      const avg = calcWeightedAverage(s.assignments)!;
      return sum + letterToGpa(scoreToLetterGrade(avg));
    }, 0);
    return totalGpa / subjectsWithGrades.length;
  }, [subjects]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-peach-light flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-peach" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Grades Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Track assignments and calculate your GPA
            </p>
          </div>
        </div>
        <Button
          data-ocid="grades.subject.open_modal_button"
          onClick={() => setAddOpen(true)}
          className="bg-peach text-white rounded-xl font-display font-semibold"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Subject
        </Button>
      </motion.div>

      {/* GPA summary card */}
      {overallGpa !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="shadow-card border-0 bg-gradient-to-r from-lavender-pale to-peach-pale"
            data-ocid="grades.gpa.card"
          >
            <CardContent className="px-5 py-4 flex items-center gap-4">
              <div className="text-center">
                <p className="font-display font-black text-4xl text-lavender">
                  {overallGpa.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Overall GPA
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex-1">
                <p className="text-sm font-body text-foreground/80">
                  Based on{" "}
                  <strong>
                    {
                      subjects.filter(
                        (s) => calcWeightedAverage(s.assignments) !== null,
                      ).length
                    }
                  </strong>{" "}
                  subject{subjects.length !== 1 ? "s" : ""} tracked
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A=4.0 · B=3.0 · C=2.0 · D=1.0 · F=0
                </p>
              </div>
              <Badge
                className={`text-lg px-3 py-1 font-display font-bold border-0 ${gradeColor(
                  scoreToLetterGrade(overallGpa * 25),
                )}`}
              >
                {overallGpa >= 3.5
                  ? "A"
                  : overallGpa >= 2.5
                    ? "B"
                    : overallGpa >= 1.5
                      ? "C"
                      : overallGpa >= 0.5
                        ? "D"
                        : "F"}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subjects */}
      {subjects.length === 0 ? (
        <motion.div
          data-ocid="grades.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-peach-pale flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-peach/60" />
          </div>
          <div>
            <p className="font-display font-semibold text-muted-foreground">
              No subjects yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add a subject to start tracking your grades
            </p>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05 }}
              >
                <SubjectCard
                  subject={subject}
                  onUpdate={handleUpdateSubject}
                  onDelete={() => handleDeleteSubject(subject.id)}
                  index={i + 1}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add subject dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent
          data-ocid="grades.subject.dialog"
          className="max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Subject</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Label className="text-xs">Subject Name</Label>
            <Input
              data-ocid="grades.subject.input"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
              placeholder="e.g. Mathematics, History…"
              className="mt-1 rounded-xl"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              data-ocid="grades.subject.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="grades.subject.submit_button"
              className="flex-1 rounded-xl bg-peach text-white"
              onClick={handleAddSubject}
              disabled={!newSubjectName.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
