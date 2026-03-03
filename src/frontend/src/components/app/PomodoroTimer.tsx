import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pause, Play, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Quote,
  addFocusMinutes,
  addStreakDay,
  getRandomQuote,
  todayString,
} from "../../lib/localStorage";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type Mode = "focus" | "break";

interface QuoteModalProps {
  quote: Quote | null;
  open: boolean;
  onClose: () => void;
}

function QuoteModal({ quote, open, onClose }: QuoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="pomodoro.modal"
        className="max-w-sm rounded-2xl border-0 shadow-elevated bg-card"
      >
        <DialogHeader>
          <div className="text-4xl text-center mb-2">🎉</div>
          <DialogTitle className="text-center font-display text-xl">
            Great session! Keep it up.
          </DialogTitle>
        </DialogHeader>
        {quote && (
          <div className="bg-lavender-pale rounded-xl p-4 mt-2 text-center">
            <p className="font-body italic text-foreground text-sm leading-relaxed">
              "{quote.text}"
            </p>
            {quote.author && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                — {quote.author}
              </p>
            )}
          </div>
        )}
        <Button
          data-ocid="pomodoro.modal.close_button"
          onClick={onClose}
          className="w-full mt-2 bg-lavender text-primary-foreground font-display font-semibold rounded-xl"
        >
          Start Break Timer
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = 1 - secondsLeft / totalSeconds;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const completeSession = useCallback(() => {
    setIsRunning(false);
    if (mode === "focus") {
      addStreakDay(todayString());
      addFocusMinutes(25);
      const q = getRandomQuote();
      setCurrentQuote(q);
      setShowQuote(true);
    } else {
      // Break done — reset to focus
      setMode("focus");
      setSecondsLeft(FOCUS_SECONDS);
    }
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, completeSession]);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const handleCloseQuote = () => {
    setShowQuote(false);
    setMode("break");
    setSecondsLeft(BREAK_SECONDS);
    setIsRunning(true);
  };

  // SVG ring
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Mode badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-display font-semibold ${
            mode === "focus"
              ? "bg-lavender-light text-lavender"
              : "bg-sage-light text-sage"
          }`}
        >
          {mode === "focus" ? "🎯 Focus Time" : "☕ Break Time"}
        </div>

        {/* Timer ring */}
        <div className="relative w-36 h-36">
          <svg
            width="144"
            height="144"
            className="rotate-[-90deg]"
            role="img"
            aria-label="Timer progress"
          >
            <title>Timer progress: {display}</title>
            {/* Track */}
            <circle
              cx="72"
              cy="72"
              r={RADIUS}
              fill="none"
              stroke="oklch(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress */}
            <motion.circle
              cx="72"
              cy="72"
              r={RADIUS}
              fill="none"
              stroke={
                mode === "focus"
                  ? "oklch(var(--lavender))"
                  : "oklch(var(--sage))"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={display}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="font-display font-bold text-2xl tabular-nums text-foreground"
              >
                {display}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            data-ocid="pomodoro.reset.button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl w-9 h-9 p-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            data-ocid="pomodoro.toggle.button"
            size="sm"
            onClick={() => setIsRunning((r) => !r)}
            disabled={secondsLeft === 0}
            className={`rounded-xl px-5 font-display font-semibold ${
              mode === "focus"
                ? "bg-lavender text-primary-foreground hover:bg-lavender/90"
                : "bg-sage text-white hover:bg-sage/90"
            }`}
          >
            {isRunning ? (
              <Pause className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Play className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isRunning ? "Pause" : "Start"}
          </Button>
        </div>
      </div>

      <QuoteModal
        quote={currentQuote}
        open={showQuote}
        onClose={handleCloseQuote}
      />
    </>
  );
}
