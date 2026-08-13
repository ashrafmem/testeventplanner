import Link from "next/link";

const FEATURES = [
  {
    title: "Describe it, don't build it",
    body: "Tell the AI what you're planning — \"3-day Hindu wedding in Jaipur\" or \"weekend 50th birthday\" — and get a full multi-day itinerary in seconds.",
    icon: "✦",
  },
  {
    title: "Any tradition, any celebration",
    body: "Weddings, religious ceremonies, birthdays, anniversaries, baby showers — the itinerary adapts to the culture and customs you describe, and every detail stays editable.",
    icon: "🎉",
  },
  {
    title: "One link, simple RSVPs",
    body: "Share a single link. Guests see the full schedule and RSVP yes, no, or maybe — per day for multi-day events — no account needed.",
    icon: "💌",
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-amber-50 to-stone-50">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-rose-700 shadow-sm ring-1 ring-rose-200">
            ✦ AI-generated itineraries for multi-day celebrations
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight text-stone-900">
            Plan the whole celebration.
            <br />
            <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              Let AI draft the schedule.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
            Hosts describe their celebration in a sentence — any tradition, any
            number of days — and get a ready-to-edit itinerary plus a shareable
            RSVP page for guests. No spreadsheets, no group chats.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
            >
              Start planning as a host
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-200 hover:bg-stone-50 transition-colors"
            >
              Host login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-stone-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-3xl bg-stone-900 px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-semibold text-white">
            Are you a guest with an RSVP link?
          </h2>
          <p className="mt-2 text-stone-300">
            Open the link your host shared with you — no account or app needed.
          </p>
        </div>
      </section>
    </div>
  );
}
