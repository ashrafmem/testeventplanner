import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RsvpForm from "@/components/RsvpForm";

export default async function PublicRsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      days: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } },
    },
  });

  if (!event) notFound();

  return (
    <div className="flex-1 bg-gradient-to-b from-rose-50 via-amber-50 to-stone-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-rose-600">
            {event.tradition || "You're invited"}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-stone-900">
            {event.title}
          </h1>
          {event.subtitle && <p className="mt-2 text-stone-600">{event.subtitle}</p>}
          {event.location && (
            <p className="mt-2 text-sm text-stone-500">📍 {event.location}</p>
          )}
        </div>

        {event.coverNote && (
          <div className="mt-8 rounded-2xl bg-white px-6 py-5 text-center ring-1 ring-stone-200 shadow-sm">
            <p className="text-stone-700 italic">&ldquo;{event.coverNote}&rdquo;</p>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {event.days.map((day, i) => (
            <div key={day.id} className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                  Day {i + 1}
                </span>
                {day.date && (
                  <span className="text-xs text-stone-400">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg font-semibold text-stone-900">{day.title}</h2>
              {day.description && (
                <p className="mt-1 text-sm text-stone-600">{day.description}</p>
              )}

              <div className="mt-4 space-y-3">
                {day.items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-t border-stone-100 pt-3 first:border-0 first:pt-0">
                    <div className="w-20 shrink-0 text-sm font-medium text-stone-500">
                      {item.time}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {[item.location, item.dressCode].filter(Boolean).join(" · ")}
                      </p>
                      {item.description && (
                        <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <RsvpForm slug={event.slug} days={event.days.map((d) => ({ id: d.id, title: d.title }))} />
        </div>
      </div>
    </div>
  );
}
