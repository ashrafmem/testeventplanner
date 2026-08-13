"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
    >
      Sign out
    </button>
  );
}
