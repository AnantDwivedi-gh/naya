"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ff0000",
          colorBackground: "#000000",
          colorText: "#ffffff",
          colorTextSecondary: "#999999",
          colorInputBackground: "#111111",
          colorInputText: "#ffffff",
          fontFamily: "'JetBrains Mono', monospace",
          borderRadius: "0px",
        },
        elements: {
          card: "bg-black border border-white/10",
          headerTitle: "font-mono tracking-[0.2em] uppercase",
          headerSubtitle: "font-mono text-white/40",
          formButtonPrimary: "bg-red-500 hover:bg-red-400 text-black font-mono uppercase tracking-wider",
          formFieldInput: "bg-[#111] border-white/10 font-mono",
          footerActionLink: "text-red-500 hover:text-red-400",
          socialButtonsBlockButton: "border-white/20 font-mono",
          dividerLine: "bg-white/10",
          dividerText: "text-white/20 font-mono",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
