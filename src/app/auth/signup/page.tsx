"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Check,
  X,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function getPasswordScore(checks: PasswordChecks): number {
  return Object.values(checks).filter(Boolean).length;
}

function validatePasswordLocal(pw: string): {
  checks: PasswordChecks;
  score: number;
  valid: boolean;
} {
  const checks: PasswordChecks = {
    minLength: pw.length >= 8,
    hasUppercase: /[A-Z]/.test(pw),
    hasLowercase: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  };
  const score = getPasswordScore(checks);
  return { checks, score, valid: checks.minLength && score >= 4 };
}

function PasswordStrength({
  password,
}: {
  password: string;
}) {
  const { checks, score, valid } = validatePasswordLocal(password);

  if (!password) return null;

  const strengthLabel =
    score <= 1
      ? "VERY WEAK"
      : score === 2
      ? "WEAK"
      : score === 3
      ? "FAIR"
      : score === 4
      ? "STRONG"
      : "VERY STRONG";

  const strengthColor =
    score <= 1
      ? "bg-red-500"
      : score === 2
      ? "bg-red-500"
      : score === 3
      ? "bg-yellow-500"
      : "bg-green-500";

  const rules: { key: keyof PasswordChecks; label: string }[] = [
    { key: "minLength", label: "At least 8 characters" },
    { key: "hasUppercase", label: "One uppercase letter (A-Z)" },
    { key: "hasLowercase", label: "One lowercase letter (a-z)" },
    { key: "hasNumber", label: "One number (0-9)" },
    { key: "hasSpecial", label: "One special character (!@#$...)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2"
    >
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-[3px] flex-1 transition-colors duration-200 ${
                i < score ? strengthColor : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <span
          className={`text-[9px] font-mono tracking-[0.1em] ${
            score <= 2
              ? "text-red-500"
              : score === 3
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {strengthLabel}
        </span>
      </div>

      {/* Rules checklist */}
      <div className="space-y-1">
        {rules.map((rule) => (
          <div key={rule.key} className="flex items-center gap-1.5">
            {checks[rule.key] ? (
              <Check size={9} className="text-green-500" />
            ) : (
              <X size={9} className="text-white/20" />
            )}
            <span
              className={`text-[9px] font-mono ${
                checks[rule.key] ? "text-white/40" : "text-white/20"
              }`}
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // Live username validation
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // Client-side format check
    if (!/^[a-z0-9._]+$/.test(username)) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timeout = setTimeout(() => {
      // In real app: call API to check availability
      // For now: simulate
      const reserved = ["admin", "naya", "system", "root", "api", "auth"];
      if (reserved.includes(username)) {
        setUsernameStatus("taken");
      } else {
        setUsernameStatus("available");
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [username]);

  const { valid: passwordValid } = validatePasswordLocal(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else {
          setError(data.error);
        }
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const canSubmit =
    username.length >= 3 &&
    email.includes("@") &&
    passwordValid &&
    !loading;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block">
            <h1 className="font-mono text-2xl font-bold tracking-[0.3em]">
              NAYA<span className="text-red-500">.</span>
            </h1>
          </a>
        </div>

        {/* Card */}
        <div className="border border-white/10 bg-black">
          <div className="border-b border-white/5 px-6 py-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-white/40">
              AUTH://REGISTER
            </span>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h2 className="font-mono text-lg font-bold tracking-[0.15em] flex items-center gap-2">
                <UserPlus size={18} className="text-red-500" />
                CREATE ACCOUNT
              </h2>
              <p className="text-[11px] font-mono text-white/30 mt-1 tracking-wide">
                JOIN THE NAYA NETWORK
              </p>
            </div>

            {/* Global error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 border border-red-500/30 bg-red-500/5 px-3 py-2"
                >
                  <AlertCircle size={12} className="text-red-500 shrink-0" />
                  <span className="text-[10px] font-mono text-red-400">
                    {error.toUpperCase()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GitHub OAuth */}
            <button
              onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-3 border border-white/20 bg-transparent px-4 py-3 font-mono text-xs tracking-[0.1em] text-white/80 hover:border-white hover:text-white transition-colors duration-150"
            >
              <Github size={16} />
              SIGN UP WITH GITHUB
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono text-white/20 tracking-[0.2em]">
                OR
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Username */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
                  Username
                </label>
                <div className="flex items-center gap-2 border border-white/10 bg-black px-3 h-10 focus-within:border-white/40 transition-colors">
                  <span className="text-xs font-mono text-white/20 select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""));
                      setFieldErrors((prev) => ({ ...prev, username: "" }));
                    }}
                    required
                    minLength={3}
                    maxLength={20}
                    placeholder="your.handle"
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/15"
                    autoComplete="username"
                  />
                  {usernameStatus === "checking" && (
                    <span className="w-2 h-2 bg-yellow-500 animate-pulse" />
                  )}
                  {usernameStatus === "available" && (
                    <Check size={12} className="text-green-500" />
                  )}
                  {usernameStatus === "taken" && (
                    <X size={12} className="text-red-500" />
                  )}
                </div>
                {fieldErrors.username && (
                  <span className="text-[9px] font-mono text-red-500">{fieldErrors.username}</span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-[9px] font-mono text-green-500">AVAILABLE</span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-[9px] font-mono text-red-500">TAKEN</span>
                )}
                <span className="text-[8px] font-mono text-white/15 block">
                  3-20 CHARS · LOWERCASE · NUMBERS · DOTS · UNDERSCORES
                </span>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
                  Email
                </label>
                <div className="flex items-center gap-2 border border-white/10 bg-black px-3 h-10 focus-within:border-white/40 transition-colors">
                  <span className="text-xs font-mono text-white/20 select-none">&gt;</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    required
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/15"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <span className="text-[9px] font-mono text-red-500">{fieldErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
                  Password
                </label>
                <div className="flex items-center gap-2 border border-white/10 bg-black px-3 h-10 focus-within:border-white/40 transition-colors">
                  <Shield size={12} className="text-white/20 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    required
                    placeholder="Create a strong password"
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/15"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/20 hover:text-white/40 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="text-[9px] font-mono text-red-500">{fieldErrors.password}</span>
                )}

                <AnimatePresence>
                  {password && <PasswordStrength password={password} />}
                </AnimatePresence>
              </div>

              {/* Password requirements summary */}
              <div className="border border-white/5 bg-white/[0.02] px-3 py-2">
                <span className="text-[9px] font-mono tracking-[0.1em] text-white/20 block">
                  // PASSWORD REQUIREMENTS
                </span>
                <span className="text-[9px] font-mono text-white/30 block mt-0.5">
                  MIN 8 CHARS + 4 OF: UPPER, LOWER, NUMBER, SYMBOL
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-black font-mono text-xs tracking-[0.15em] font-bold px-4 py-3 hover:bg-red-400 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-block w-3 h-3 border border-black/40 border-t-black animate-spin" />
                ) : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <span className="text-[9px] font-mono text-white/25 block">
                // YOUR DATA IS ENCRYPTED AND SECURE
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono text-white/25 tracking-wide">
                ALREADY HAVE AN ACCOUNT?{" "}
                <a
                  href="/auth/signin"
                  className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                >
                  SIGN IN
                </a>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <span className="text-[9px] font-mono text-white/15 tracking-[0.1em]">
            NAYA://AUTH::v0.1.0
          </span>
          <span className="text-[9px] font-mono text-white/15 tracking-[0.1em] flex items-center gap-1.5">
            <span className="w-1 h-1 bg-green-500 inline-block" />
            SECURE
          </span>
        </div>
      </motion.div>
    </div>
  );
}
