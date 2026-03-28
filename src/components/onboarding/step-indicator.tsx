"use client";

import { motion } from "framer-motion";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <motion.div
            key={step}
            className="relative"
            initial={false}
            animate={{
              scale: isCurrent ? 1 : 0.85,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Dash style indicator */}
            <motion.div
              className="h-[3px]"
              style={{ width: isCurrent ? 24 : 12 }}
              initial={false}
              animate={{
                backgroundColor: isCurrent
                  ? "#ff0000"
                  : isCompleted
                  ? "#ffffff"
                  : "#333333",
                width: isCurrent ? 24 : 12,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </motion.div>
        );
      })}

      {/* Step counter */}
      <span className="ml-3 text-2xs font-mono uppercase tracking-[0.2em] text-gray-500">
        {String(currentStep).padStart(2, "0")}/{String(totalSteps).padStart(2, "0")}
      </span>
    </div>
  );
}
