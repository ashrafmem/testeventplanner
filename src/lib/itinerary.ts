// Shared types + AI-assisted generation for multi-day celebration itineraries.

export type ItineraryItem = {
  time?: string;
  title: string;
  location?: string;
  dressCode?: string;
  description?: string;
};

export type ItineraryDay = {
  title: string;
  description?: string;
  items: ItineraryItem[];
};

export type Itinerary = {
  title: string;
  subtitle?: string;
  tradition?: string;
  location?: string;
  coverNote?: string;
  days: ItineraryDay[];
};

const ITINERARY_JSON_SHAPE = `{
  "title": string,               // short event title, e.g. "Anjali & Rohan's Wedding Celebration"
  "subtitle": string,             // one-line tagline
  "tradition": string,            // e.g. "Hindu wedding", "Catholic wedding", "Birthday", "Baby shower"
  "location": string,             // city / venue area if mentioned or a sensible placeholder
  "coverNote": string,            // warm 1-2 sentence welcome message to guests
  "days": [
    {
      "title": string,           // e.g. "Mehendi & Sangeet"
      "description": string,     // 1 sentence description of the day
      "items": [
        {
          "time": string,        // e.g. "5:00 PM"
          "title": string,       // e.g. "Mehendi ceremony"
          "location": string,
          "dressCode": string,
          "description": string
        }
      ]
    }
  ]
}`;

function buildSystemPrompt() {
  return `You are an expert event planner assistant embedded in a multi-day celebration planning app.
Given a short prompt from a host describing a celebration (which may be a wedding, religious ceremony, birthday, anniversary, or other multi-day event, in any culture or tradition), produce a realistic, respectful, well-structured itinerary spanning the appropriate number of days.

Respond with ONLY valid JSON matching this exact shape (no markdown fences, no commentary):
${ITINERARY_JSON_SHAPE}

Guidelines:
- Infer the number of days and typical events from the tradition mentioned (e.g. a Hindu wedding might include Haldi, Mehendi, Sangeet, Wedding Ceremony, Reception; a Christian wedding might include Rehearsal Dinner, Ceremony, Reception; a birthday might be single or multi-day with a welcome dinner).
- If the host specifies a number of days or specific events, honor them exactly.
- Keep each day to 2-5 items.
- Be culturally respectful and accurate about ceremony names and customs.
- Never invent guest names; use the ones given, otherwise keep it generic.
- All text fields must be plain strings (never null, use empty string "" if unknown).`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in AI response");
  return JSON.parse(candidate.slice(start, end + 1));
}

function coerceItinerary(raw: unknown, fallbackTitle: string): Itinerary {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const daysRaw = Array.isArray(obj.days) ? obj.days : [];

  const days: ItineraryDay[] = daysRaw.map((d) => {
    const day = (d ?? {}) as Record<string, unknown>;
    const itemsRaw = Array.isArray(day.items) ? day.items : [];
    return {
      title: String(day.title ?? "Celebration"),
      description: day.description ? String(day.description) : undefined,
      items: itemsRaw.map((it) => {
        const item = (it ?? {}) as Record<string, unknown>;
        return {
          time: item.time ? String(item.time) : undefined,
          title: String(item.title ?? "Event"),
          location: item.location ? String(item.location) : undefined,
          dressCode: item.dressCode ? String(item.dressCode) : undefined,
          description: item.description ? String(item.description) : undefined,
        };
      }),
    };
  });

  return {
    title: obj.title ? String(obj.title) : fallbackTitle,
    subtitle: obj.subtitle ? String(obj.subtitle) : undefined,
    tradition: obj.tradition ? String(obj.tradition) : undefined,
    location: obj.location ? String(obj.location) : undefined,
    coverNote: obj.coverNote ? String(obj.coverNote) : undefined,
    days: days.length > 0 ? days : templateItinerary(fallbackTitle).days,
  };
}

// Rule-based fallback used when no ANTHROPIC_API_KEY is configured, or the AI
// call fails for any reason. Keeps the app fully usable out of the box.
export function templateItinerary(prompt: string): Itinerary {
  const lower = prompt.toLowerCase();

  const isWedding = /wedding|marriage|shaadi|nikah|vivaah/.test(lower);
  const isBirthday = /birthday/.test(lower);
  const isAnniversary = /anniversary/.test(lower);
  const isBabyShower = /baby shower|godh bharai/.test(lower);

  const isHindu = /hindu|indian wedding|shaadi|vivaah|sangeet|mehendi|haldi/.test(lower);
  const isMuslim = /muslim|nikah|walima|islamic/.test(lower);
  const isChristian = /christian|catholic|church wedding/.test(lower);
  const isJewish = /jewish|ketubah|chuppah/.test(lower);

  const dayCountMatch = lower.match(/(\d+)\s*-?\s*day/);
  const explicitDays = dayCountMatch ? parseInt(dayCountMatch[1], 10) : undefined;

  let tradition = "Celebration";
  let days: ItineraryDay[] = [];

  if (isWedding) {
    if (isHindu) {
      tradition = "Hindu wedding";
      days = [
        {
          title: "Haldi Ceremony",
          description: "A joyful turmeric ceremony to bless the couple.",
          items: [
            { time: "10:00 AM", title: "Haldi ceremony", dressCode: "Yellow attire", description: "Turmeric paste applied for good luck and glowing skin." },
            { time: "1:00 PM", title: "Family lunch", description: "Casual lunch for close family." },
          ],
        },
        {
          title: "Mehendi & Sangeet",
          description: "Henna art by day, music and dance by night.",
          items: [
            { time: "4:00 PM", title: "Mehendi ceremony", dressCode: "Bright colors", description: "Intricate henna designs for the bride and guests." },
            { time: "7:30 PM", title: "Sangeet night", dressCode: "Festive / Indo-western", description: "Performances, music and dancing." },
          ],
        },
        {
          title: "Wedding Ceremony",
          description: "The main wedding rituals.",
          items: [
            { time: "9:00 AM", title: "Baraat / Welcome procession", description: "Groom's arrival procession." },
            { time: "11:00 AM", title: "Wedding ceremony (Pheras)", dressCode: "Traditional formal", description: "Sacred fire rituals and vows." },
            { time: "7:00 PM", title: "Reception dinner", dressCode: "Formal", description: "Dinner and celebration with all guests." },
          ],
        },
      ];
    } else if (isMuslim) {
      tradition = "Muslim wedding";
      days = [
        {
          title: "Mehendi Night",
          description: "Henna and music with close family.",
          items: [{ time: "6:00 PM", title: "Mehendi night", dressCode: "Colorful", description: "Henna art and music." }],
        },
        {
          title: "Nikah Ceremony",
          description: "The religious marriage contract ceremony.",
          items: [
            { time: "4:00 PM", title: "Nikah ceremony", dressCode: "Traditional formal", description: "Marriage contract signed before family and an officiant." },
            { time: "7:00 PM", title: "Walima reception", dressCode: "Formal", description: "Wedding feast hosted by the groom's family." },
          ],
        },
      ];
    } else if (isChristian) {
      tradition = "Christian wedding";
      days = [
        {
          title: "Rehearsal Dinner",
          description: "Wedding party rehearsal and casual dinner.",
          items: [{ time: "6:00 PM", title: "Rehearsal dinner", dressCode: "Smart casual", description: "Toasts and rehearsal for the ceremony." }],
        },
        {
          title: "Wedding Day",
          description: "Ceremony followed by reception.",
          items: [
            { time: "2:00 PM", title: "Church ceremony", dressCode: "Formal", description: "Vows exchanged at the church." },
            { time: "6:00 PM", title: "Reception & dinner", dressCode: "Formal", description: "Dinner, first dance, and toasts." },
          ],
        },
      ];
    } else if (isJewish) {
      tradition = "Jewish wedding";
      days = [
        {
          title: "Welcome Dinner",
          description: "Casual gathering the night before.",
          items: [{ time: "6:30 PM", title: "Welcome dinner", dressCode: "Smart casual" }],
        },
        {
          title: "Wedding Day",
          description: "Ketubah signing, chuppah ceremony and celebration.",
          items: [
            { time: "3:00 PM", title: "Ketubah signing", description: "Signing of the marriage contract." },
            { time: "5:00 PM", title: "Chuppah ceremony", dressCode: "Formal", description: "Vows exchanged under the chuppah." },
            { time: "7:00 PM", title: "Reception - Hora & dinner", dressCode: "Formal" },
          ],
        },
      ];
    } else {
      tradition = "Wedding";
      days = [
        {
          title: "Welcome Dinner",
          description: "An informal gathering to welcome guests.",
          items: [{ time: "6:30 PM", title: "Welcome dinner", dressCode: "Smart casual" }],
        },
        {
          title: "Wedding Day",
          description: "Ceremony and reception.",
          items: [
            { time: "3:00 PM", title: "Ceremony", dressCode: "Formal" },
            { time: "6:00 PM", title: "Reception & dinner", dressCode: "Formal" },
          ],
        },
      ];
    }
  } else if (isBirthday) {
    tradition = "Birthday celebration";
    days = [
      {
        title: "Birthday Celebration",
        description: "Cake, food and fun with friends and family.",
        items: [
          { time: "6:00 PM", title: "Welcome & mingling", dressCode: "Casual" },
          { time: "7:30 PM", title: "Dinner", description: "" },
          { time: "9:00 PM", title: "Cake cutting & toasts" },
        ],
      },
    ];
  } else if (isAnniversary) {
    tradition = "Anniversary celebration";
    days = [
      {
        title: "Anniversary Celebration",
        description: "An evening honoring the couple's journey.",
        items: [
          { time: "6:30 PM", title: "Cocktail hour", dressCode: "Semi-formal" },
          { time: "7:30 PM", title: "Dinner & toasts" },
          { time: "9:00 PM", title: "Dancing" },
        ],
      },
    ];
  } else if (isBabyShower) {
    tradition = "Baby shower";
    days = [
      {
        title: "Baby Shower",
        description: "Games, gifts, and good wishes for the parents-to-be.",
        items: [
          { time: "1:00 PM", title: "Guest arrival & lunch", dressCode: "Casual" },
          { time: "2:30 PM", title: "Games" },
          { time: "3:30 PM", title: "Gift opening" },
        ],
      },
    ];
  } else {
    tradition = "Celebration";
    days = [
      {
        title: "Celebration Day",
        description: "A day to celebrate together.",
        items: [
          { time: "6:00 PM", title: "Welcome reception", dressCode: "Casual" },
          { time: "7:30 PM", title: "Dinner" },
        ],
      },
    ];
  }

  if (explicitDays && explicitDays !== days.length) {
    if (explicitDays < days.length) {
      days = days.slice(0, explicitDays);
    } else {
      const last = days[days.length - 1];
      while (days.length < explicitDays) {
        days.push({ ...last, title: `${last.title} (cont.)` });
      }
    }
  }

  const titleGuess = isWedding
    ? `${tradition} Celebration`
    : `${tradition}`;

  return {
    title: titleGuess,
    subtitle: "Generated from your prompt — feel free to edit every detail.",
    tradition,
    location: undefined,
    coverNote: "We can't wait to celebrate with you! Please RSVP below.",
    days,
  };
}

export async function generateItinerary(
  prompt: string
): Promise<{ itinerary: Itinerary; source: "ai" | "fallback"; note?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      itinerary: templateItinerary(prompt),
      source: "fallback",
      note: "ANTHROPIC_API_KEY is not configured, so a built-in template generator was used instead of AI.",
    };
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 2000,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI response did not contain text content");
    }

    const parsed = extractJson(textBlock.text);
    return { itinerary: coerceItinerary(parsed, "Our Celebration"), source: "ai" };
  } catch (err) {
    return {
      itinerary: templateItinerary(prompt),
      source: "fallback",
      note:
        err instanceof Error
          ? `AI generation failed (${err.message}); used the built-in template generator instead.`
          : "AI generation failed; used the built-in template generator instead.",
    };
  }
}
