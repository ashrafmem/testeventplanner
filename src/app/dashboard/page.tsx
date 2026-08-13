import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const events = await prisma.event.findMany({
    where: { hostId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { rsvps: true } } },
  });

  return (
    <div className="flex-1 bg-stone-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              Your celebrations
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Create a new one from an AI prompt, or manage an existing one.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
          >
            + New celebration
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-stone-600">
              You haven&apos;t created any celebrations yet.
            </p>
            <Link
              href="/dashboard/new"
              className="mt-4 inline-block rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
            >
              Plan your first celebration
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/${event.id}`}
                className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm hover:shadow-md hover:ring-rose-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-rose-600">
                      {event.tradition || "Celebration"}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-stone-900">
                      {event.title}
                    </h2>
                  </div>
                </div>
                {event.subtitle && (
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                    {event.subtitle}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-stone-500">
                  {event.location && <span>📍 {event.location}</span>}
                  <span>💌 {event._count.rsvps} RSVP{event._count.rsvps === 1 ? "" : "s"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
