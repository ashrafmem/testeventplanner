import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

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

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  tradition: z.string().optional(),
  location: z.string().optional(),
  coverNote: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prompt: z.string().default(""),
  days: z.array(daySchema).min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { hostId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { rsvps: true } } },
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = slugify(data.title);

  const event = await prisma.event.create({
    data: {
      slug,
      title: data.title,
      subtitle: data.subtitle,
      tradition: data.tradition,
      location: data.location,
      coverNote: data.coverNote,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      prompt: data.prompt,
      hostId: session.user.id,
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
    },
    include: { days: { include: { items: true } } },
  });

  return NextResponse.json({ event });
}
