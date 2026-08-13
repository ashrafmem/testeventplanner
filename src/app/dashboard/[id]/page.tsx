import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import EventEditor from "@/components/EventEditor";
import RsvpPanel from "@/components/RsvpPanel";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const baseUrl = await getBaseUrl();

  const event = await prisma.event.findFirst({
    where: { id, hostId: session!.user!.id },
    include: {
      days: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } },
      rsvps: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!event) notFound();

  const yes = event.rsvps.filter((r) => r.status === "yes");
  const no = event.rsvps.filter((r) => r.status === "no");
  const maybe = event.rsvps.filter((r) => r.status === "maybe");
  const totalGuests = yes.reduce((sum, r) => sum + r.guestCount, 0);

  return (
    <div className="flex-1 bg-stone-50">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-rose-600">
            {event.tradition || "Celebration"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">{event.title}</h1>
          {event.subtitle && <p className="mt-1 text-stone-600">{event.subtitle}</p>}
        </div>

        <RsvpPanel
          rsvpUrl={`${baseUrl}/rsvp/${event.slug}`}
          stats={{
            yes: yes.length,
            no: no.length,
            maybe: maybe.length,
            totalGuests,
          }}
          rsvps={event.rsvps.map((r) => ({
            id: r.id,
            guestName: r.guestName,
            status: r.status,
            guestCount: r.guestCount,
            dietary: r.dietary,
            message: r.message,
            email: r.email,
            createdAt: r.createdAt.toISOString(),
          }))}
        />

        <EventEditor
          eventId={event.id}
          initial={{
            title: event.title,
            subtitle: event.subtitle ?? "",
            tradition: event.tradition ?? "",
            location: event.location ?? "",
            coverNote: event.coverNote ?? "",
            startDate: event.startDate ? event.startDate.toISOString().slice(0, 10) : "",
            days: event.days.map((d) => ({
              title: d.title,
              description: d.description ?? "",
              items: d.items.map((it) => ({
                time: it.time ?? "",
                title: it.title,
                location: it.location ?? "",
                dressCode: it.dressCode ?? "",
                description: it.description ?? "",
              })),
            })),
          }}
        />
      </div>
    </div>
  );
}
