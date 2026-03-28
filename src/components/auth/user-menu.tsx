"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-[11px] font-mono tracking-[0.15em] text-white/40 hover:text-white transition-colors">
            SIGN IN
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="text-[11px] font-mono tracking-[0.15em] bg-red-500 text-black px-4 py-2 hover:bg-red-400 transition-colors">
            GET STARTED
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 border border-white/20",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
