"use client";

import { useState } from "react";

type Day = { id: string; title: string };

export default function RsvpForm({ slug, days }: { slug: string; days: Day[] }) {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"yes" | "no" | "maybe">("yes");
  const [guestCount, setGuestCount] = useState(1);
  const [attendingDays, setAttendingDays] = useState<string[]>(days.map((d) => d.id));
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function toggleDay(id: string) {
    setAttendingDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/rsvp/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          email,
          status,
          guestCount,
          attendingDays: status === "no" ? [] : attendingDays,
          dietary,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit RSVP");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-200">
        <div className="text-3xl">✓</div>
        <h3 className="mt-2 text-lg font-semibold text-emerald-900">
          Thank you, {guestName}!
        </h3>
        <p className="mt-1 text-sm text-emerald-800">
          Your RSVP has been recorded. See you at the celebration!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm space-y-5">
      <h3 className="text-lg font-semibold text-stone-900">RSVP</h3>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700">Your name</label>
        <input
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Will you attend?</label>
        <div className="mt-2 flex gap-2">
          {(["yes", "maybe", "no"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ring-1 transition-colors ${
                status === s
                  ? "bg-stone-900 text-white ring-stone-900"
                  : "bg-white text-stone-700 ring-stone-300 hover:bg-stone-50"
              }`}
            >
              {s === "yes" ? "Joyfully accept" : s === "maybe" ? "Maybe" : "Can't make it"}
            </button>
          ))}
        </div>
      </div>

      {status !== "no" && (
        <>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Number of guests (including yourself)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
              className="mt-1 w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {days.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Which day(s) will you attend?
              </label>
              <div className="mt-2 space-y-2">
                {days.map((day) => (
                  <label key={day.id} className="flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={attendingDays.includes(day.id)}
                      onChange={() => toggleDay(day.id)}
                      className="rounded border-stone-300"
                    />
                    {day.title}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Dietary restrictions (optional)
            </label>
            <input
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Vegetarian, allergies, etc."
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Message to the hosts (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700 transition-colors disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Send RSVP"}
      </button>
    </form>
  );
}
