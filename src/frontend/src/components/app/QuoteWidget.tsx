import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const STUDY_QUOTES = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "W.B. Yeats",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    text: "The more that you read, the more things you will know.",
    author: "Dr. Seuss",
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  { text: "Every expert was once a beginner.", author: "Helen Hayes" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
];

export function QuoteWidget() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * STUDY_QUOTES.length),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STUDY_QUOTES.length);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const quote = STUDY_QUOTES[index];

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-4 min-h-[72px] flex items-center gap-5"
      style={{
        background:
          "linear-gradient(105deg, oklch(0.9 0.04 280 / 0.6) 0%, oklch(0.93 0.025 220 / 0.5) 50%, oklch(0.92 0.04 55 / 0.35) 100%)",
      }}
      data-ocid="dashboard.quote.card"
    >
      {/* Oversized decorative serif quote mark */}
      <span
        className="shrink-0 font-display font-black leading-none select-none text-lavender"
        style={{
          fontSize: "5rem",
          lineHeight: 1,
          opacity: 0.18,
          marginTop: "-0.25rem",
        }}
        aria-hidden="true"
      >
        "
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="flex-1 min-w-0"
        >
          <p className="font-display font-semibold text-sm text-foreground leading-snug">
            {quote.text}
          </p>
          <p className="text-xs font-body text-muted-foreground mt-1 tracking-wide uppercase">
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicator */}
      <div className="shrink-0 flex gap-1 items-center self-end pb-0.5">
        {STUDY_QUOTES.map((q, i) => (
          <button
            key={q.text.slice(0, 20)}
            type="button"
            aria-label={`Quote ${i + 1}`}
            onClick={() => setIndex(i)}
            className="transition-all duration-300"
            style={{
              width: i === index ? "14px" : "5px",
              height: "5px",
              borderRadius: "9999px",
              backgroundColor:
                i === index
                  ? "oklch(var(--lavender))"
                  : "oklch(var(--lavender) / 0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
