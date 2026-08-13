import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">Create your host account</h1>
          <p className="mt-2 text-sm text-stone-600">
            Plan a wedding, ceremony, or any multi-day celebration.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm">
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-rose-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
