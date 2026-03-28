"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignInPageInner />
    </Suspense>
  );
}

function SignInPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "CredentialsSignin"
      ? "Invalid email or password"
      : errorParam === "OAuthAccountNotLinked"
      ? "This email is linked to a different sign-in method"
      : errorParam
      ? "Something went wrong. Please try again."
      : ""
  );

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? "Invalid email or password"
          : res.error
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function handleGitHub() {
    setGithubLoading(true);
    signIn("github", { callbackUrl });
  }

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
              AUTH://SIGN-IN
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="font-mono text-lg font-bold tracking-[0.15em]">
                SIGN IN
              </h2>
              <p className="text-[11px] font-mono text-white/30 mt-1 tracking-wide">
                ACCESS YOUR NAYA WORKSPACE
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 border border-red-500/30 bg-red-500/5 px-3 py-2"
              >
                <AlertCircle size={12} className="text-red-500 shrink-0" />
                <span className="text-[10px] font-mono text-red-400 tracking-wide">
                  {error.toUpperCase()}
                </span>
              </motion.div>
            )}

            {/* GitHub OAuth */}
            <button
              onClick={handleGitHub}
              disabled={githubLoading}
              className="w-full flex items-center justify-center gap-3 border border-white/20 bg-transparent px-4 py-3 font-mono text-xs tracking-[0.1em] text-white/80 hover:border-white hover:text-white transition-colors duration-150 disabled:opacity-40"
            >
              {githubLoading ? (
                <span className="inline-block w-3 h-3 border border-white/40 border-t-white animate-spin" />
              ) : (
                <Github size={16} />
              )}
              CONTINUE WITH GITHUB
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono text-white/20 tracking-[0.2em]">
                OR
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Credentials form */}
            <form onSubmit={handleCredentials} className="space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/15"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
                  Password
                </label>
                <div className="flex items-center gap-2 border border-white/10 bg-black px-3 h-10 focus-within:border-white/40 transition-colors">
                  <span className="text-xs font-mono text-white/20 select-none">&gt;</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/15"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/20 hover:text-white/40 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-black font-mono text-xs tracking-[0.15em] font-bold px-4 py-3 hover:bg-red-400 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-block w-3 h-3 border border-black/40 border-t-black animate-spin" />
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div className="border border-white/5 bg-white/[0.02] px-3 py-2.5 space-y-1">
              <span className="text-[10px] font-mono tracking-[0.15em] text-white/25 block">
                // DEMO ACCOUNT
              </span>
              <span className="text-[10px] font-mono text-white/35 block">
                demo@naya.app / Naya@2024!
              </span>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <span className="text-[10px] font-mono text-white/25 tracking-wide">
                NO ACCOUNT?{" "}
                <a
                  href="/auth/signup"
                  className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                >
                  CREATE ONE
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
