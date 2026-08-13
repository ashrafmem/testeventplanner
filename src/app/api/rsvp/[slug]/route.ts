import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Public route: fetch just enough about an event for guests to view + RSVP.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      subtitle: true,
      tradition: true,
      location: true,
      coverNote: true,
      startDate: true,
      endDate: true,
      days: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          items: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              time: true,
              title: true,
              location: true,
              dressCode: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

const rsvpSchema = z.object({
  guestName: z.string().min(1, "Name is required").max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  status: z.enum(["yes", "no", "maybe"]),
  guestCount: z.number().int().min(1).max(20).default(1),
  attendingDays: z.array(z.string()).default([]),
  dietary: z.string().max(500).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const rsvp = await prisma.rsvp.create({
    data: {
      eventId: event.id,
      guestName: data.guestName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      status: data.status,
      guestCount: data.status === "no" ? 0 : data.guestCount,
      attendingDays: data.attendingDays.join(","),
      dietary: data.dietary || undefined,
      message: data.message || undefined,
    },
  });

  return NextResponse.json({ rsvp });
}
