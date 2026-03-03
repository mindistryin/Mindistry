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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Priority, type Task } from "../backend.d";
import {
  useCreateTask,
  useDeleteTask,
  useSubjects,
  useTasks,
  useUpdateTask,
} from "../hooks/useQueries";
import { bigIntNsToDate } from "../lib/localStorage";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> =
  {
    [Priority.low]: { label: "Low", className: "bg-sage-light text-sage" },
    [Priority.medium]: {
      label: "Medium",
      className: "bg-peach-light text-peach",
    },
    [Priority.high]: { label: "High", className: "bg-coral-light text-coral" },
  };

interface TaskFormData {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  priority: Priority;
}

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  subjectId: "__none__",
  dueDate: new Date().toISOString().slice(0, 10),
  priority: Priority.medium,
};

function TaskFormDialog({
  open,
  onClose,
  initialData,
  editTask,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: TaskFormData & { id?: string };
  editTask?: Task;
}) {
  const { data: subjects = [] } = useSubjects();
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask();

  const [form, setForm] = useState<TaskFormData>(initialData ?? emptyForm);

  const isPending = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;

    try {
      const subjectId = form.subjectId === "__none__" ? null : form.subjectId;
      if (editTask) {
        await updateTask({
          id: editTask.id,
          title: form.title.trim(),
          description: form.description,
          subjectId,
          dueDate: new Date(form.dueDate),
          priority: form.priority,
          completed: editTask.completed,
        });
        toast.success("Task updated!");
      } else {
        await createTask({
          title: form.title.trim(),
          description: form.description,
          subjectId,
          dueDate: new Date(form.dueDate),
          priority: form.priority,
        });
        toast.success("Task created!");
      }
      onClose();
      setForm(emptyForm);
    } catch {
      toast.error("Failed to save task.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="task.dialog" className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editTask ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-3 mt-1"
        >
          <div>
            <Label className="text-xs font-medium">Title *</Label>
            <Input
              data-ocid="task.input"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Task title"
              className="mt-1 rounded-xl"
              required
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              data-ocid="task.textarea"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional description"
              className="mt-1 rounded-xl resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Subject</Label>
              <Select
                value={form.subjectId}
                onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}
              >
                <SelectTrigger
                  data-ocid="task.select"
                  className="mt-1 rounded-xl"
                >
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No subject</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as Priority }))
                }
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.low}>Low</SelectItem>
                  <SelectItem value={Priority.medium}>Medium</SelectItem>
                  <SelectItem value={Priority.high}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Due Date *</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              className="mt-1 rounded-xl"
              required
            />
          </div>
          <DialogFooter className="pt-1 gap-2">
            <Button
              data-ocid="task.cancel_button"
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="task.submit_button"
              type="submit"
              disabled={isPending}
              className="rounded-xl flex-1 bg-lavender text-primary-foreground"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {editTask ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskCard({
  task,
  index,
  subjectMap,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  subjectMap: Map<string, { name: string; color: string }>;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const { mutateAsync: updateTask, isPending } = useUpdateTask();
  const subject = task.subjectId ? subjectMap.get(task.subjectId) : null;
  const due = bigIntNsToDate(task.dueDate);
  const isOverdue = !task.completed && due < new Date();
  const pc = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG[Priority.medium];

  const handleToggle = async () => {
    try {
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        subjectId: task.subjectId ?? null,
        dueDate: due,
        priority: task.priority,
        completed: !task.completed,
      });
    } catch {
      toast.error("Failed to update task");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      data-ocid={`task.item.${index}`}
    >
      <Card
        className={`shadow-card border-0 transition-all ${task.completed ? "opacity-60" : ""}`}
      >
        <CardContent className="px-4 py-3 flex items-start gap-3">
          <Checkbox
            data-ocid={`task.checkbox.${index}`}
            checked={task.completed}
            disabled={isPending}
            onCheckedChange={() => {
              void handleToggle();
            }}
            className="mt-0.5 data-[state=checked]:bg-lavender data-[state=checked]:border-lavender"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`font-body font-medium text-sm leading-snug ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {subject && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${subject.color}25`,
                    color: subject.color,
                  }}
                >
                  {subject.name}
                </span>
              )}
              <Badge
                className={`text-xs px-2 py-0.5 font-medium border-0 ${pc.className}`}
              >
                {pc.label}
              </Badge>
              <span
                className={`text-xs ${isOverdue ? "text-coral font-semibold" : "text-muted-foreground"}`}
              >
                {isOverdue ? "⚠ " : ""}
                {due.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              data-ocid={`task.edit_button.${index}`}
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(task)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              data-ocid={`task.delete_button.${index}`}
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PlannerPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: subjects = [] } = useSubjects();
  const { mutateAsync: deleteTask } = useDeleteTask();

  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [tab, setTab] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("__all__");

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const s of subjects) map.set(s.id, { name: s.name, color: s.color });
    return map;
  }, [subjects]);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const filteredTasks = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(23, 59, 59, 999);

    let list = [...tasks];

    // Tab filter
    if (tab === "today")
      list = list.filter(
        (t) => !t.completed && bigIntNsToDate(t.dueDate) <= cutoff,
      );
    else if (tab === "upcoming")
      list = list.filter(
        (t) => !t.completed && bigIntNsToDate(t.dueDate) > cutoff,
      );
    else if (tab === "completed") list = list.filter((t) => t.completed);
    else list = list.filter((t) => !t.completed || tab === "all");

    // Subject filter
    if (subjectFilter !== "__all__")
      list = list.filter((t) => t.subjectId === subjectFilter);

    // Sort by dueDate asc
    list.sort((a, b) => Number(a.dueDate - b.dueDate));
    return list;
  }, [tasks, tab, subjectFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
    setDeleteTarget(null);
  };

  const editFormData = editTask
    ? {
        id: editTask.id,
        title: editTask.title,
        description: editTask.description,
        subjectId: editTask.subjectId ?? "__none__",
        dueDate: bigIntNsToDate(editTask.dueDate).toISOString().slice(0, 10),
        priority: editTask.priority,
      }
    : undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Task Planner</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.filter((t) => !t.completed).length} tasks remaining
          </p>
        </div>
        <Button
          data-ocid="task.open_modal_button"
          onClick={() => {
            setEditTask(null);
            setShowForm(true);
          }}
          className="bg-lavender text-primary-foreground rounded-xl font-display font-semibold"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList className="rounded-xl bg-muted h-8">
            <TabsTrigger
              data-ocid="task.all.tab"
              value="all"
              className="text-xs rounded-lg h-6 px-3"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              data-ocid="task.today.tab"
              value="today"
              className="text-xs rounded-lg h-6 px-3"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              data-ocid="task.upcoming.tab"
              value="upcoming"
              className="text-xs rounded-lg h-6 px-3"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              data-ocid="task.completed.tab"
              value="completed"
              className="text-xs rounded-lg h-6 px-3"
            >
              Done
            </TabsTrigger>
          </TabsList>
          <TabsContent value={tab} />
        </Tabs>

        {subjects.length > 0 && (
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-36 h-8 text-xs rounded-xl">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div data-ocid="task.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div
          data-ocid="task.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <AlertCircle className="w-8 h-8 text-muted-foreground/40" />
          <p className="font-display font-semibold text-muted-foreground">
            No tasks found
          </p>
          <p className="text-sm text-muted-foreground/60">
            Add a task to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i + 1}
              subjectMap={subjectMap}
              onEdit={(t) => {
                setEditTask(t);
                setShowForm(true);
              }}
              onDelete={(t) => setDeleteTarget(t)}
            />
          ))}
        </div>
      )}

      {/* Form dialog */}
      <TaskFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditTask(null);
        }}
        initialData={editFormData}
        editTask={editTask ?? undefined}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="task.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Task?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="task.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="task.delete.confirm_button"
              onClick={() => {
                void handleDelete();
              }}
              className="rounded-xl bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
