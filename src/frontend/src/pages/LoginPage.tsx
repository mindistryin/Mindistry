import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  { icon: "📋", label: "Smart Planner", desc: "Track tasks & deadlines" },
  { icon: "⏱️", label: "Pomodoro Timer", desc: "Focus in 25-min sprints" },
  { icon: "📅", label: "Auto Timetable", desc: "Generate weekly schedules" },
  { icon: "🔥", label: "Study Streaks", desc: "Stay consistent every day" },
];

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-pastel flex flex-col items-center justify-center px-4 overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-lavender-light opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-sage-light opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-[-100px] w-48 h-48 rounded-full bg-peach-light opacity-30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo + Name */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-lavender-light shadow-pastel mb-5"
          >
            <span className="text-4xl">📚</span>
          </motion.div>

          <h1 className="text-5xl font-display font-bold text-lavender mb-2 tracking-tight">
            BoardBoss
          </h1>
          <p className="text-muted-foreground font-body text-base">
            Your personal student productivity hub
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
              className="bg-card rounded-xl p-4 shadow-card flex flex-col gap-1"
            >
              <span className="text-2xl">{f.icon}</span>
              <p className="font-display font-semibold text-sm text-foreground">
                {f.label}
              </p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-display font-semibold bg-lavender text-primary-foreground hover:bg-lavender/90 rounded-xl shadow-pastel"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in to BoardBoss"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Secured by Internet Identity — no password needed
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <p className="absolute bottom-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </p>
    </div>
  );
}
