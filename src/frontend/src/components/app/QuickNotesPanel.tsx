import { Pencil, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getQuickNotes, saveQuickNotes } from "../../lib/localStorage";

export function QuickNotesPanel() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => getQuickNotes());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveQuickNotes(text);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text]);

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-72 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
            data-ocid="quicknotes.panel"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-lavender-pale">
              <div className="flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5 text-lavender" />
                <span className="font-display text-xs font-semibold text-foreground">
                  Quick Notes
                </span>
              </div>
              <button
                type="button"
                data-ocid="quicknotes.close_button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <textarea
                data-ocid="quicknotes.textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Jot something down… ideas, reminders, anything."
                className="w-full h-56 px-3 py-2.5 text-sm font-body bg-card text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-0"
              />
            </div>
            <div className="px-3 py-1.5 border-t border-border bg-muted/30">
              <p className="text-[10px] text-muted-foreground">
                Auto-saved · {text.length} chars
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        data-ocid="quicknotes.open_modal_button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-11 h-11 rounded-full shadow-elevated flex items-center justify-center transition-colors ${
          open
            ? "bg-lavender text-white"
            : "bg-card border border-border text-lavender hover:bg-lavender-pale"
        }`}
        aria-label="Toggle quick notes"
      >
        <Pencil className="w-4.5 h-4.5" />
      </motion.button>
    </div>
  );
}
