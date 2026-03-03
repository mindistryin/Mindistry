import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useSaveUserProfile } from "../hooks/useQueries";

export function SetupProfilePage() {
  const [name, setName] = useState("");
  const { actor, isFetching } = useActor();
  const { mutateAsync, isPending } = useSaveUserProfile();

  if (isFetching || !actor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-lavender-light animate-pulse" />
          <p className="text-muted-foreground font-body text-sm">Connecting…</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await mutateAsync(name.trim());
      toast.success("Welcome to BoardBoss!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("Not connected")) {
        toast.error("Still connecting. Please wait a moment and try again.");
      } else {
        toast.error("Failed to save profile. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-pastel flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-card rounded-2xl shadow-elevated p-8"
      >
        <div className="text-center mb-6">
          <span className="text-4xl">👋</span>
          <h2 className="text-2xl font-display font-bold mt-3 mb-1">
            What's your name?
          </h2>
          <p className="text-sm text-muted-foreground">
            Let's personalise your BoardBoss experience
          </p>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name" className="text-sm font-body font-medium">
              Your name
            </Label>
            <Input
              id="name"
              data-ocid="setup.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="mt-1.5 h-11 rounded-xl"
              autoFocus
            />
          </div>
          <Button
            data-ocid="setup.submit_button"
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full h-11 font-display font-semibold bg-lavender text-primary-foreground rounded-xl"
          >
            {isPending ? "Saving…" : "Let's go! →"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
