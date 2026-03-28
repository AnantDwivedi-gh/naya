"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import {
  saveOnboardingData,
  completeOnboarding,
  isOnboardingComplete,
} from "@/lib/onboarding";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 6;

const INTERESTS = [
  "FACT-CHECKING",
  "PRODUCTIVITY",
  "CONTENT CREATION",
  "PRIVACY",
  "ACCESSIBILITY",
  "DEV TOOLS",
  "SOCIAL MEDIA",
  "ENTERTAINMENT",
  "ANALYTICS",
  "AUTOMATION",
  "AI/ML",
  "DESIGN",
] as const;

const APPS = [
  "INSTAGRAM",
  "TWITTER/X",
  "YOUTUBE",
  "LINKEDIN",
  "REDDIT",
  "TIKTOK",
  "GMAIL",
  "SPOTIFY",
  "GITHUB",
  "DISCORD",
  "SLACK",
  "NOTION",
] as const;

const PLACEHOLDER_IDEAS = [
  "Fact-check Instagram posts in real time...",
  "Summarize YouTube videos into bullet points...",
  "Auto-translate tweets into my language...",
  "Hide spoilers on Reddit until I'm ready...",
  "Track price drops on any product page...",
  "Generate alt-text for images on any site...",
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const pageVariants = {
  enter: { x: 80, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
};

const pageTransition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
};

const staggerContainer = {
  center: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  enter: { y: 12, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: -8, opacity: 0 },
};

// ---------------------------------------------------------------------------
// Toggle button component
// ---------------------------------------------------------------------------

function ToggleTag({
  label,
  selected,
  onClick,
  index,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      variants={staggerItem}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={`
        px-4 py-2.5 font-mono text-xs uppercase tracking-wider border transition-all duration-150
        ${
          selected
            ? "bg-red border-red text-black font-bold"
            : "bg-black border-gray-700 text-gray-400 hover:border-white hover:text-white"
        }
      `}
    >
      {label}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Typing effect hook
// ---------------------------------------------------------------------------

function useTypingEffect(text: string, speed: number = 35, startDelay: number = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(delayTimer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ---------------------------------------------------------------------------
// Cycling placeholder hook
// ---------------------------------------------------------------------------

function useCyclingPlaceholder(items: string[], interval: number = 3000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  return items[index];
}

// ---------------------------------------------------------------------------
// Step 1: Welcome
// ---------------------------------------------------------------------------

function StepWelcome({ onNext }: { onNext: () => void }) {
  const valueProp =
    "Naya lets you build custom features for any app — from fact-checkers to auto-translators — and share them with the world. No code required.";
  const { displayed, done } = useTypingEffect(valueProp, 25, 600);

  return (
    <motion.div
      variants={staggerContainer}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-start gap-8 max-w-lg"
    >
      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <h1 className="text-4xl font-bold tracking-tight leading-none">
          WELCOME TO{" "}
          <span className="text-red">NAYA</span>.
        </h1>
      </motion.div>

      <motion.p
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="text-lg text-gray-400 tracking-tight"
      >
        Build features for any app. Share with everyone.
      </motion.p>

      {/* Terminal typing */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="w-full border border-gray-700 bg-gray-900 p-4 font-mono text-sm"
      >
        <div className="flex items-start gap-2">
          <span className="text-red select-none">{">"}</span>
          <div className="text-gray-400 min-h-[4rem]">
            {displayed}
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-[7px] h-[14px] bg-red ml-0.5 align-middle"
              />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <button onClick={onNext} className="btn-primary">
          LET&apos;S GO
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Username
// ---------------------------------------------------------------------------

function StepUsername({
  onNext,
  username,
  setUsername,
}: {
  onNext: () => void;
  username: string;
  setUsername: (v: string) => void;
}) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidFormat = /^[a-z0-9._]{1,30}$/.test(username);

  const handleChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9._]/g, "");
    setUsername(sanitized);
    setAvailable(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (sanitized.length >= 3 && /^[a-z0-9._]{3,30}$/.test(sanitized)) {
      setChecking(true);
      timerRef.current = setTimeout(() => {
        setChecking(false);
        setAvailable(true);
      }, 1000);
    } else {
      setChecking(false);
    }
  };

  const canProceed = username.length >= 3 && isValidFormat && available === true;

  return (
    <motion.div
      variants={staggerContainer}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-start gap-8 max-w-lg"
    >
      <motion.h2
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold tracking-tight"
      >
        PICK YOUR USERNAME
      </motion.h2>

      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="flex items-center border border-gray-700 bg-black px-4 py-3 focus-within:border-red transition-colors">
          <span className="text-red font-mono text-sm mr-2 select-none">{">"}</span>
          <input
            type="text"
            value={username}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="your.username"
            maxLength={30}
            className="flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-gray-500"
            autoFocus
          />
        </div>

        {/* Status line */}
        <div className="mt-3 h-5 flex items-center gap-2">
          {username.length > 0 && username.length < 3 && (
            <span className="text-2xs text-gray-500 font-mono uppercase tracking-wider">
              MIN 3 CHARACTERS
            </span>
          )}
          {checking && (
            <span className="text-2xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
              <motion.span
                className="inline-block w-1.5 h-1.5 bg-yellow"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              CHECKING AVAILABILITY...
            </span>
          )}
          {available === true && !checking && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xs text-green font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <span className="inline-block w-1.5 h-1.5 bg-green" />
              AVAILABLE
            </motion.span>
          )}
        </div>

        <p className="mt-2 text-2xs text-gray-500 font-mono uppercase tracking-wider">
          LOWERCASE, NUMBERS, DOTS, UNDERSCORES
        </p>
      </motion.div>

      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <button
          onClick={() => {
            saveOnboardingData({ username });
            onNext();
          }}
          disabled={!canProceed}
          className="btn-primary"
        >
          NEXT
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Interests
// ---------------------------------------------------------------------------

function StepInterests({
  onNext,
  selected,
  setSelected,
}: {
  onNext: () => void;
  selected: string[];
  setSelected: (v: string[]) => void;
}) {
  const toggle = (item: string) => {
    setSelected(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item]
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-start gap-8 max-w-2xl"
    >
      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl font-bold tracking-tight">
          SELECT YOUR INTERESTS
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose at least 3 to personalize your feed.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="flex flex-wrap gap-2"
      >
        {INTERESTS.map((interest, i) => (
          <ToggleTag
            key={interest}
            label={interest}
            selected={selected.includes(interest)}
            onClick={() => toggle(interest)}
            index={i}
          />
        ))}
      </motion.div>

      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => {
            saveOnboardingData({ interests: selected });
            onNext();
          }}
          disabled={selected.length < 3}
          className="btn-primary"
        >
          NEXT
        </button>
        {selected.length > 0 && selected.length < 3 && (
          <span className="text-2xs text-gray-500 font-mono uppercase tracking-wider">
            {3 - selected.length} MORE REQUIRED
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Apps
// ---------------------------------------------------------------------------

function StepApps({
  onNext,
  selected,
  setSelected,
}: {
  onNext: () => void;
  selected: string[];
  setSelected: (v: string[]) => void;
}) {
  const toggle = (item: string) => {
    setSelected(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item]
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-start gap-8 max-w-2xl"
    >
      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl font-bold tracking-tight">
          CHOOSE YOUR APPS
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Which apps do you use most? Select at least 1.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
      >
        {APPS.map((app, i) => (
          <ToggleTag
            key={app}
            label={app}
            selected={selected.includes(app)}
            onClick={() => toggle(app)}
            index={i}
          />
        ))}
      </motion.div>

      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <button
          onClick={() => {
            saveOnboardingData({ apps: selected });
            onNext();
          }}
          disabled={selected.length < 1}
          className="btn-primary"
        >
          NEXT
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: First Feature
// ---------------------------------------------------------------------------

function StepFeatureIdea({
  onNext,
  onSkip,
  idea,
  setIdea,
}: {
  onNext: () => void;
  onSkip: () => void;
  idea: string;
  setIdea: (v: string) => void;
}) {
  const placeholder = useCyclingPlaceholder(PLACEHOLDER_IDEAS, 3000);

  return (
    <motion.div
      variants={staggerContainer}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-start gap-8 max-w-lg"
    >
      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl font-bold tracking-tight">
          YOUR FIRST FEATURE
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          What feature do you wish existed? Describe it below.
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="border border-gray-700 bg-black focus-within:border-red transition-colors">
          <div className="flex items-start px-4 pt-3">
            <span className="text-red font-mono text-sm mr-2 mt-0.5 select-none">{">"}</span>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={placeholder}
              rows={5}
              className="flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-gray-500 resize-none"
            />
          </div>
          <div className="px-4 pb-2 flex justify-end">
            <span className="text-2xs text-gray-500 font-mono">
              {idea.length > 0 ? `${idea.length} CHARS` : "OPTIONAL"}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        {idea.trim().length > 0 ? (
          <button
            onClick={() => {
              saveOnboardingData({ featureIdea: idea });
              onNext();
            }}
            className="btn-primary"
          >
            CREATE IT
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary">
            SKIP
          </button>
        )}
        {idea.trim().length > 0 && (
          <button onClick={onNext} className="btn-ghost text-gray-500">
            SKIP
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Ready
// ---------------------------------------------------------------------------

function AnimatedCounter({ target, label }: { target: string; label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
      transition={{ duration: 0.4 }}
      className="flex items-baseline gap-2"
    >
      <span className="text-xl font-bold text-white">{target}</span>
      <span className="text-2xs text-gray-500 font-mono uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}

function StepReady({ featureIdea }: { featureIdea: string }) {
  const router = useRouter();

  useEffect(() => {
    completeOnboarding();
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-start gap-10 max-w-lg"
    >
      <motion.div variants={staggerItem} transition={{ duration: 0.3 }}>
        {/* NAYA logo with red pulse */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0px 0px rgba(255,0,0,0)",
              "0 0 20px 4px rgba(255,0,0,0.3)",
              "0 0 0px 0px rgba(255,0,0,0)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block border border-red px-4 py-2 mb-6"
        >
          <span className="text-xl font-bold text-red tracking-wider">NAYA</span>
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight leading-none">
          YOU&apos;RE ALL SET.
        </h1>
      </motion.div>

      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3 w-full border border-gray-700 bg-gray-900 p-6"
      >
        <AnimatedCounter target="0" label="features created" />
        <AnimatedCounter target="0" label="deployed" />
        <AnimatedCounter target="12,847" label="in the community" />
      </motion.div>

      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => router.push("/explore")}
          className="btn-primary"
        >
          EXPLORE FEATURES
        </button>
        <button
          onClick={() => {
            if (featureIdea.trim()) {
              router.push(`/create?prompt=${encodeURIComponent(featureIdea)}`);
            } else {
              router.push("/create");
            }
          }}
          className="btn-secondary"
        >
          CREATE YOUR FIRST
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Onboarding Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // State for each step
  const [username, setUsername] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [apps, setApps] = useState<string[]>([]);
  const [featureIdea, setFeatureIdea] = useState("");

  // Redirect if already completed
  useEffect(() => {
    if (isOnboardingComplete()) {
      router.replace("/explore");
    }
  }, [router]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // Override animation direction
  const directedVariants = {
    enter: { x: direction > 0 ? 80 : -80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: direction > 0 ? -80 : 80, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
        <span className="text-xs font-mono font-bold tracking-wider text-white">
          NAYA
        </span>
        <StepIndicator totalSteps={TOTAL_STEPS} currentStep={step} />
        {step > 1 && step < TOTAL_STEPS && (
          <button
            onClick={goBack}
            className="text-2xs font-mono uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
          >
            BACK
          </button>
        )}
        {(step === 1 || step === TOTAL_STEPS) && <div className="w-10" />}
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            variants={directedVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
          >
            {step === 1 && <StepWelcome onNext={goNext} />}
            {step === 2 && (
              <StepUsername
                onNext={goNext}
                username={username}
                setUsername={setUsername}
              />
            )}
            {step === 3 && (
              <StepInterests
                onNext={goNext}
                selected={interests}
                setSelected={setInterests}
              />
            )}
            {step === 4 && (
              <StepApps
                onNext={goNext}
                selected={apps}
                setSelected={setApps}
              />
            )}
            {step === 5 && (
              <StepFeatureIdea
                onNext={goNext}
                onSkip={goNext}
                idea={featureIdea}
                setIdea={setFeatureIdea}
              />
            )}
            {step === 6 && <StepReady featureIdea={featureIdea} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom subtle line */}
      <div className="fixed bottom-8 left-6 right-6">
        <div className="h-px bg-gray-700/30" />
      </div>
    </div>
  );
}
