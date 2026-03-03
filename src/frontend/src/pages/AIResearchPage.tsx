import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Atom,
  BookMarked,
  Brain,
  Clock,
  ExternalLink,
  FlaskConical,
  Globe,
  Loader2,
  Microscope,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateMaterial } from "../hooks/useQueries";

interface DDGResult {
  Abstract: string;
  AbstractText: string;
  AbstractURL: string;
  AbstractSource: string;
  Image: string;
  Heading: string;
  RelatedTopics: Array<{
    Text?: string;
    FirstURL?: string;
    Topics?: Array<{ Text: string; FirstURL: string }>;
  }>;
}

// Topic chips with icons + category colour
const TOPIC_CHIPS: Array<{
  label: string;
  icon: React.ElementType;
  color: string;
  pale: string;
}> = [
  {
    label: "Photosynthesis",
    icon: Microscope,
    color: "oklch(var(--sage))",
    pale: "oklch(var(--sage-pale))",
  },
  {
    label: "French Revolution",
    icon: Globe,
    color: "oklch(var(--peach))",
    pale: "oklch(var(--peach-pale))",
  },
  {
    label: "Pythagoras theorem",
    icon: Atom,
    color: "oklch(var(--lavender))",
    pale: "oklch(var(--lavender-pale))",
  },
  {
    label: "DNA replication",
    icon: FlaskConical,
    color: "oklch(var(--sky))",
    pale: "oklch(var(--sky-pale))",
  },
  {
    label: "World War 2",
    icon: Clock,
    color: "oklch(var(--peach))",
    pale: "oklch(var(--peach-pale))",
  },
  {
    label: "Gravity physics",
    icon: Atom,
    color: "oklch(var(--lavender))",
    pale: "oklch(var(--lavender-pale))",
  },
  {
    label: "Cell division mitosis",
    icon: Microscope,
    color: "oklch(var(--sage))",
    pale: "oklch(var(--sage-pale))",
  },
  {
    label: "Industrial Revolution",
    icon: Globe,
    color: "oklch(var(--sky))",
    pale: "oklch(var(--sky-pale))",
  },
  {
    label: "Black holes",
    icon: Brain,
    color: "oklch(var(--lavender))",
    pale: "oklch(var(--lavender-pale))",
  },
  {
    label: "Climate change",
    icon: Globe,
    color: "oklch(var(--sage))",
    pale: "oklch(var(--sage-pale))",
  },
  {
    label: "Quantum mechanics",
    icon: FlaskConical,
    color: "oklch(var(--sky))",
    pale: "oklch(var(--sky-pale))",
  },
  {
    label: "Roman Empire",
    icon: Clock,
    color: "oklch(var(--peach))",
    pale: "oklch(var(--peach-pale))",
  },
];

export function AIResearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DDGResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { mutateAsync: createMaterial } = useCreateMaterial();

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    if (q) setQuery(q);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Search failed");
      const data: DDGResult = await res.json();
      setResult(data);
      if (!data.AbstractText && data.RelatedTopics.length === 0) {
        setError(
          "No summary found for this topic. Try a more specific search query.",
        );
      }
    } catch {
      setError("Unable to fetch results. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsNote = async () => {
    if (!result || !query.trim()) return;
    setSaving(true);
    try {
      const title = result.Heading || query;
      const content =
        result.AbstractText ||
        result.RelatedTopics.slice(0, 3)
          .map((t) => t.Text)
          .filter(Boolean)
          .join("\n\n");
      await createMaterial({
        title,
        content,
        subjectId: null,
        tags: [query.toLowerCase().trim()],
      });
      toast.success("Saved to Study Materials!");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const relatedTopics = result?.RelatedTopics?.filter(
    (t) => t.Text && t.FirstURL && !t.Topics,
  ).slice(0, 5);

  const showExplore = !result && !loading && !error;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* ── Editorial header band ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="research-hero rounded-2xl px-6 py-6 shadow-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-lavender text-white flex items-center justify-center shadow-pastel">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-foreground leading-none">
              AI Research
            </h1>
            <p className="text-xs font-body text-muted-foreground mt-0.5 uppercase tracking-wider">
              Instant answers · Any topic · Save to notes
            </p>
          </div>
        </div>

        {/* Search bar — full-width inside hero */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSearch();
          }}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="research.search_input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any study topic…"
                className="pl-10 h-11 rounded-xl text-sm bg-card/80 border-border/60 focus-visible:ring-2 focus-visible:ring-lavender/40"
                disabled={loading}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResult(null);
                    setError(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              data-ocid="research.submit_button"
              type="submit"
              disabled={loading || !query.trim()}
              className="h-11 px-5 bg-lavender text-white rounded-xl font-display font-semibold shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-1.5" />
                  Search
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* ── Loading skeletons ──────────────────────────────────────────── */}
      {loading && (
        <motion.div
          data-ocid="research.loading_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="h-44 bg-muted rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-muted rounded-xl animate-pulse" />
            <div className="h-20 bg-muted rounded-xl animate-pulse" />
            <div className="h-20 bg-muted rounded-xl animate-pulse" />
            <div className="h-20 bg-muted rounded-xl animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error && !loading && (
        <motion.div
          data-ocid="research.error_state"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-peach-pale border border-peach-light px-5 py-4"
        >
          <p className="font-display font-semibold text-sm mb-1">
            No results found
          </p>
          <p className="text-muted-foreground text-xs">{error}</p>
        </motion.div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            data-ocid="research.result.card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Main result */}
            <Card className="shadow-card border-0 overflow-hidden">
              <div className="bg-lavender-pale px-5 pt-5 pb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground leading-tight">
                    {result.Heading || query}
                  </h2>
                  {result.AbstractSource && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {result.AbstractSource}
                    </p>
                  )}
                </div>
                <Button
                  data-ocid="research.save.button"
                  size="sm"
                  onClick={() => void handleSaveAsNote()}
                  disabled={saving}
                  className="bg-lavender text-white rounded-xl font-display shrink-0"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <BookMarked className="w-3.5 h-3.5 mr-1" />
                  )}
                  Save Note
                </Button>
              </div>
              <CardContent className="px-5 py-4">
                <div className="flex gap-4">
                  {result.Image && (
                    <img
                      src={
                        result.Image.startsWith("http")
                          ? result.Image
                          : `https://duckduckgo.com${result.Image}`
                      }
                      alt={result.Heading}
                      className="w-24 h-24 rounded-xl object-cover shrink-0 shadow-card"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {result.AbstractText ? (
                      <p className="text-sm font-body leading-relaxed text-foreground/90">
                        {result.AbstractText}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No summary available. See related topics below.
                      </p>
                    )}
                    {result.AbstractURL && (
                      <a
                        href={result.AbstractURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-lavender hover:underline mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Read more on {result.AbstractSource || "source"}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related topics */}
            {relatedTopics && relatedTopics.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-2">
                  Related Topics
                </h3>
                <div className="space-y-2">
                  {relatedTopics.map((topic, i) => (
                    <motion.div
                      key={topic.FirstURL ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      data-ocid={`research.related.item.${i + 1}`}
                      className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/40 transition-colors"
                    >
                      <Badge className="bg-lavender-pale text-lavender border-0 text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body text-foreground/90 leading-snug line-clamp-2">
                          {topic.Text}
                        </p>
                        {topic.FirstURL && (
                          <a
                            href={topic.FirstURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-lavender hover:underline mt-0.5 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Learn more
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Explore grid (replaces generic empty state) ───────────────── */}
      <AnimatePresence>
        {showExplore && (
          <motion.div
            data-ocid="research.empty_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <p className="text-xs font-body text-muted-foreground uppercase tracking-widest mb-3">
              Popular topics to explore
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TOPIC_CHIPS.map(({ label, icon: Icon, color, pale }, idx) => (
                <motion.button
                  key={label}
                  type="button"
                  data-ocid="research.suggested.button"
                  onClick={() => void handleSearch(label)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -1.5, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-shadow hover:shadow-card"
                  style={{ backgroundColor: pale }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="font-display font-semibold text-xs text-foreground leading-tight truncate">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
