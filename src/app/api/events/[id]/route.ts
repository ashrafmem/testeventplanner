import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  time: z.string().optional(),
  title: z.string().min(1),
  location: z.string().optional(),
  dressCode: z.string().optional(),
  description: z.string().optional(),
});

const daySchema = z.object({
  title: z.string().min(1),
  date: z.string().optional(),
  description: z.string().optional(),
  items: z.array(itemSchema).default([]),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().optional(),
  tradition: z.string().optional(),
  location: z.string().optional(),
  coverNote: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.array(daySchema).optional(),
});

async function getOwnedEvent(id: string, hostId: string) {
  return prisma.event.findFirst({ where: { id, hostId } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, hostId: session.user.id },
    include: {
      days: { orderBy: { order: "asc" }, include: { items: { orderBy: { order: "asc" } } } },
      rsvps: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const owned = await getOwnedEvent(id, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.days) {
    // Full replace of the itinerary: simplest consistent model for an editor.
    await prisma.eventDay.deleteMany({ where: { eventId: id } });
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      subtitle: data.subtitle,
      tradition: data.tradition,
      location: data.location,
      coverNote: data.coverNote,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      ...(data.days
        ? {
            days: {
              create: data.days.map((day, dayIndex) => ({
                order: dayIndex,
                title: day.title,
                description: day.description,
                date: day.date ? new Date(day.date) : undefined,
                items: {
                  create: day.items.map((item, itemIndex) => ({
                    order: itemIndex,
                    time: item.time,
                    title: item.title,
                    location: item.location,
                    dressCode: item.dressCode,
                    description: item.description,
                  })),
                },
              })),
            },
          }
        : {}),
    },
    include: { days: { include: { items: true } } },
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const owned = await getOwnedEvent(id, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
