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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { StudyMaterial } from "../backend.d";
import {
  useCreateMaterial,
  useDeleteMaterial,
  useMaterials,
  useSubjects,
  useUpdateMaterial,
} from "../hooks/useQueries";
import {
  type Flashcard,
  bigIntNsToDate,
  generateId,
  getFlashcards,
  saveFlashcards,
} from "../lib/localStorage";

interface MaterialForm {
  title: string;
  content: string;
  subjectId: string;
  tags: string;
}

const emptyForm: MaterialForm = {
  title: "",
  content: "",
  subjectId: "__none__",
  tags: "",
};

function MaterialFormDialog({
  open,
  onClose,
  editMaterial,
}: {
  open: boolean;
  onClose: () => void;
  editMaterial?: StudyMaterial;
}) {
  const { data: subjects = [] } = useSubjects();
  const { mutateAsync: createMaterial, isPending: isCreating } =
    useCreateMaterial();
  const { mutateAsync: updateMaterial, isPending: isUpdating } =
    useUpdateMaterial();

  const [form, setForm] = useState<MaterialForm>(
    editMaterial
      ? {
          title: editMaterial.title,
          content: editMaterial.content,
          subjectId: editMaterial.subjectId ?? "__none__",
          tags: editMaterial.tags.join(", "),
        }
      : emptyForm,
  );

  const isPending = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const subjectId = form.subjectId === "__none__" ? null : form.subjectId;
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      if (editMaterial) {
        await updateMaterial({
          id: editMaterial.id,
          title: form.title.trim(),
          content: form.content,
          subjectId,
          tags,
        });
        toast.success("Material updated!");
      } else {
        await createMaterial({
          title: form.title.trim(),
          content: form.content,
          subjectId,
          tags,
        });
        toast.success("Material added!");
      }
      onClose();
    } catch {
      toast.error("Failed to save material");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="material.dialog"
        className="max-w-lg rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {editMaterial ? "Edit Material" : "Add Study Material"}
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
              data-ocid="material.input"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Chapter 5 Notes"
              className="mt-1 rounded-xl"
              required
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Content</Label>
            <Textarea
              data-ocid="material.textarea"
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              placeholder="Write your notes, summaries, or references here…"
              className="mt-1 rounded-xl resize-none"
              rows={5}
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
                  data-ocid="material.select"
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
              <Label className="text-xs font-medium">
                Tags (comma-separated)
              </Label>
              <Input
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="e.g. algebra, formulas"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-1 gap-2">
            <Button
              data-ocid="material.cancel_button"
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="material.submit_button"
              type="submit"
              disabled={isPending}
              className="rounded-xl flex-1 bg-peach text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {editMaterial ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Flashcard study mode ----
function FlashcardStudyMode({
  cards,
  onExit,
}: {
  cards: Flashcard[];
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(i + 1, cards.length - 1)), 150);
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6 p-6"
      data-ocid="flashcard.study.modal"
    >
      <div className="flex items-center justify-between w-full max-w-md">
        <p className="font-display font-semibold text-sm text-muted-foreground">
          {index + 1} / {cards.length}
        </p>
        <button
          type="button"
          data-ocid="flashcard.study.close_button"
          onClick={onExit}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Flip card */}
      <button
        type="button"
        className="w-full max-w-md h-56 cursor-pointer bg-transparent border-0 p-0"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) =>
          (e.key === " " || e.key === "Enter") && setFlipped((f) => !f)
        }
        style={{ perspective: "1200px" }}
        data-ocid="flashcard.canvas_target"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{
            transformStyle: "preserve-3d",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-lavender-pale border border-border flex flex-col items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-lavender font-display font-semibold mb-2 uppercase tracking-wide">
              Question
            </p>
            <p className="font-display font-semibold text-lg text-foreground leading-snug">
              {card.question}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Click to reveal answer
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-sage-pale border border-border flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs text-sage font-display font-semibold mb-2 uppercase tracking-wide">
              Answer
            </p>
            <p className="font-body text-base text-foreground leading-relaxed">
              {card.answer}
            </p>
          </div>
        </motion.div>
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          data-ocid="flashcard.study.pagination_prev"
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>
        <Button
          data-ocid="flashcard.study.toggle"
          variant="outline"
          size="sm"
          onClick={() => setFlipped((f) => !f)}
          className="rounded-xl px-4"
        >
          <FlipHorizontal className="w-4 h-4 mr-1" />
          Flip
        </Button>
        <Button
          data-ocid="flashcard.study.pagination_next"
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={index === cards.length - 1}
          className="rounded-xl"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ---- Flashcard panel inside material card ----
function FlashcardsPanel({ materialId }: { materialId: string }) {
  const [cards, setCards] = useState<Flashcard[]>(() =>
    getFlashcards(materialId),
  );
  const [showStudy, setShowStudy] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const persist = (updated: Flashcard[]) => {
    setCards(updated);
    saveFlashcards(materialId, updated);
  };

  const handleAdd = () => {
    if (!question.trim() || !answer.trim()) return;
    const card: Flashcard = {
      id: generateId(),
      question: question.trim(),
      answer: answer.trim(),
    };
    persist([...cards, card]);
    setQuestion("");
    setAnswer("");
    setAddOpen(false);
    toast.success("Flashcard added!");
  };

  const handleDelete = (id: string) => {
    persist(cards.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-lavender" />
          <span className="font-display text-xs font-semibold text-foreground">
            Flashcards{" "}
            {cards.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({cards.length})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {cards.length > 0 && (
            <Button
              data-ocid="flashcard.study_button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-sage hover:bg-sage-pale px-2"
              onClick={() => setShowStudy(true)}
            >
              Study
            </Button>
          )}
          <Button
            data-ocid="flashcard.open_modal_button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-lavender hover:bg-lavender-pale px-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-3 h-3 mr-0.5" />
            Add Card
          </Button>
        </div>
      </div>

      {cards.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {cards.map((card, ci) => (
            <div
              key={card.id}
              data-ocid={`flashcard.item.${ci + 1}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-lavender-pale text-xs font-body group"
            >
              <span className="truncate max-w-[120px]">{card.question}</span>
              <button
                type="button"
                data-ocid={`flashcard.delete_button.${ci + 1}`}
                onClick={() => handleDelete(card.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p
          data-ocid="flashcard.empty_state"
          className="text-xs text-muted-foreground"
        >
          No flashcards yet.
        </p>
      )}

      {/* Add flashcard dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent
          data-ocid="flashcard.dialog"
          className="max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <div>
              <Label className="text-xs">Question</Label>
              <Textarea
                data-ocid="flashcard.question.textarea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the powerhouse of the cell?"
                className="mt-1 rounded-xl resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs">Answer</Label>
              <Textarea
                data-ocid="flashcard.answer.textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="The mitochondria"
                className="mt-1 rounded-xl resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              data-ocid="flashcard.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="flashcard.submit_button"
              className="flex-1 rounded-xl bg-lavender text-white"
              onClick={handleAdd}
              disabled={!question.trim() || !answer.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Study mode overlay */}
      <AnimatePresence>
        {showStudy && (
          <FlashcardStudyMode
            cards={cards}
            onExit={() => setShowStudy(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function MaterialsPage() {
  const { data: materials = [], isLoading } = useMaterials();
  const { data: subjects = [] } = useSubjects();
  const { mutateAsync: deleteMaterial } = useDeleteMaterial();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editMaterial, setEditMaterial] = useState<StudyMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyMaterial | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const s of subjects) map.set(s.id, { name: s.name, color: s.color });
    return map;
  }, [subjects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [materials, search]);

  // Group by subject
  const grouped = useMemo(() => {
    const map = new Map<string, StudyMaterial[]>();
    for (const m of filtered) {
      const key = m.subjectId ?? "__none__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [filtered]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMaterial(deleteTarget.id);
      toast.success("Material deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Study Materials</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {materials.length} note{materials.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="material.open_modal_button"
          onClick={() => {
            setEditMaterial(null);
            setShowForm(true);
          }}
          className="bg-peach text-white rounded-xl font-display font-semibold"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Material
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="material.search_input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search materials…"
          className="pl-9 rounded-xl h-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div data-ocid="material.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="material.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground/30" />
          <p className="font-display font-semibold text-muted-foreground">
            No materials yet
          </p>
          <p className="text-sm text-muted-foreground/60">
            Add your first study note or summary
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {Array.from(grouped.entries()).map(([key, items]) => {
              const subject = key === "__none__" ? null : subjectMap.get(key);
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Subject header */}
                  <div className="flex items-center gap-2 mb-2">
                    {subject ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span
                          className="font-display font-semibold text-sm"
                          style={{ color: subject.color }}
                        >
                          {subject.name}
                        </span>
                      </div>
                    ) : (
                      <span className="font-display font-semibold text-sm text-muted-foreground">
                        General
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({items.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((m, i) => (
                      <Card
                        key={m.id}
                        data-ocid={`material.item.${i + 1}`}
                        className="shadow-card border-0 hover:shadow-pastel transition-all"
                      >
                        <CardContent className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <button
                                type="button"
                                className="text-left w-full"
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === m.id ? null : m.id,
                                  )
                                }
                              >
                                <p className="font-display font-semibold text-sm">
                                  {m.title}
                                </p>
                                {m.content && (
                                  <p
                                    className={`text-xs text-muted-foreground mt-1 ${expandedId === m.id ? "" : "line-clamp-2"}`}
                                  >
                                    {m.content}
                                  </p>
                                )}
                              </button>
                              {m.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {m.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      className="text-xs bg-peach-pale text-peach border-0 font-medium"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {bigIntNsToDate(m.updatedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </p>

                              {/* Flashcards panel — shown when expanded */}
                              <AnimatePresence>
                                {expandedId === m.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ overflow: "hidden" }}
                                  >
                                    <FlashcardsPanel materialId={m.id} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                data-ocid={`material.edit_button.${i + 1}`}
                                variant="ghost"
                                size="sm"
                                className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setEditMaterial(m);
                                  setShowForm(true);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                data-ocid={`material.delete_button.${i + 1}`}
                                variant="ghost"
                                size="sm"
                                className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeleteTarget(m)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Form dialog */}
      <MaterialFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditMaterial(null);
        }}
        editMaterial={editMaterial ?? undefined}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="material.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Material?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="material.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="material.delete.confirm_button"
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
