"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "info" | "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

const iconMap: Record<ToastType, React.ComponentType<any>> = {
  info: Info,
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
};

const colorMap: Record<ToastType, string> = {
  info: "text-white border-[#333]",
  success: "text-white border-[#333]",
  error: "text-[#ff0000] border-[#ff0000]",
  warning: "text-[#ff0000] border-[#333]",
};

const prefixMap: Record<ToastType, string> = {
  info: "[INFO]",
  success: "[OK]",
  error: "[ERR]",
  warning: "[WARN]",
};

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "flex items-start gap-2 px-3 py-2",
                "bg-black border font-mono",
                colorMap[toast.type]
              )}
            >
              <Icon size={12} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-[#666] uppercase tracking-wider">
                  {prefixMap[toast.type]}
                </span>
                <p className="text-[10px] text-[#999] leading-tight mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="text-[#666] hover:text-white transition-colors p-0.5"
              >
                <X size={10} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
