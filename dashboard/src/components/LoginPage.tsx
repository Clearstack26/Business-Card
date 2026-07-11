import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    if (result.error) setError(result.error);
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-app items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/clearstack-logo.png"
            alt="ClearStack Digital"
            className="mb-5 h-12 w-auto"
          />
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Business Card Analytics
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-card/80 px-4 py-3 text-foreground transition-[border-color] focus:border-primary focus:outline-none"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card/80 px-4 py-3 text-foreground transition-[border-color] focus:border-primary focus:outline-none"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-background transition disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
