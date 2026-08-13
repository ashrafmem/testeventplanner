import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">Host login</h1>
          <p className="mt-2 text-sm text-stone-600">
            Sign in to plan your celebration.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-stone-600">
          New host?{" "}
          <Link href="/signup" className="font-medium text-rose-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
