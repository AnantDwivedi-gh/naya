"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/80"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                  "w-full max-w-lg",
                  "bg-black border border-[#333]",
                  "font-mono text-white",
                  "outline-none",
                  className
                )}
              >
                {(title || description) && (
                  <div className="px-5 py-4 border-b border-[#222] flex items-start justify-between">
                    <div>
                      {title && (
                        <Dialog.Title className="text-xs uppercase tracking-[0.2em] font-medium">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-[10px] text-[#666]">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close asChild>
                      <button className="p-1 text-[#666] hover:text-[#ff0000] transition-colors outline-none">
                        <X size={14} />
                      </button>
                    </Dialog.Close>
                  </div>
                )}
                <div className="px-5 py-4">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function ModalTrigger({ children }: { children: React.ReactNode }) {
  return <Dialog.Trigger asChild>{children}</Dialog.Trigger>;
}

export { Modal, ModalTrigger };
