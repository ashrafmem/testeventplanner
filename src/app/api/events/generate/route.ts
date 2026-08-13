import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { generateItinerary } from "@/lib/itinerary";

const schema = z.object({
  prompt: z.string().min(5, "Tell us a bit more about your celebration").max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const result = await generateItinerary(parsed.data.prompt);
  return NextResponse.json(result);
}
