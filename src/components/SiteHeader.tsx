import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "./SignOutButton";

export default async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 text-white text-sm">
            ✦
          </span>
          Celebration Planner
        </Link>

        <nav className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-stone-400 hidden sm:inline">
                {session.user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Host login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold rounded-full bg-stone-900 text-white px-4 py-2 hover:bg-stone-700 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
