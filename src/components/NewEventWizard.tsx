"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Itinerary, ItineraryDay, ItineraryItem } from "@/lib/itinerary";

const EXAMPLE_PROMPTS = [
  "3-day Hindu wedding in Jaipur for Anjali & Rohan, including Haldi, Mehendi, Sangeet and the wedding ceremony",
  "Weekend Christian wedding with a rehearsal dinner Friday and ceremony + reception Saturday",
  "Single-day 60th birthday party with dinner and cake cutting",
  "2-day Muslim wedding with a Mehendi night and Nikah + Walima",
];

function emptyItem(): ItineraryItem {
  return { time: "", title: "", location: "", dressCode: "", description: "" };
}

function emptyDay(): ItineraryDay {
  return { title: "New day", description: "", items: [emptyItem()] };
}

export default function NewEventWizard() {
  const router = useRouter();
  const [step, setStep] = useState<"prompt" | "edit">("prompt");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");

  async function handleGenerate(promptOverride?: string) {
    const usedPrompt = promptOverride ?? prompt;
    if (usedPrompt.trim().length < 5) {
      setError("Tell us a bit more about your celebration first.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/events/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: usedPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate itinerary");

      setItinerary(data.itinerary);
      setLocation(data.itinerary.location ?? "");
      setNote(data.source === "fallback" ? data.note : null);
      setPrompt(usedPrompt);
      setStep("edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  function updateDay(index: number, patch: Partial<ItineraryDay>) {
    if (!itinerary) return;
    const days = itinerary.days.map((d, i) => (i === index ? { ...d, ...patch } : d));
    setItinerary({ ...itinerary, days });
  }

  function updateItem(dayIndex: number, itemIndex: number, patch: Partial<ItineraryItem>) {
    if (!itinerary) return;
    const days = itinerary.days.map((d, i) => {
      if (i !== dayIndex) return d;
      const items = d.items.map((it, j) => (j === itemIndex ? { ...it, ...patch } : it));
      return { ...d, items };
    });
    setItinerary({ ...itinerary, days });
  }

  function addDay() {
    if (!itinerary) return;
    setItinerary({ ...itinerary, days: [...itinerary.days, emptyDay()] });
  }

  function removeDay(index: number) {
    if (!itinerary) return;
    setItinerary({ ...itinerary, days: itinerary.days.filter((_, i) => i !== index) });
  }

  function addItem(dayIndex: number) {
    if (!itinerary) return;
    const days = itinerary.days.map((d, i) =>
      i === dayIndex ? { ...d, items: [...d.items, emptyItem()] } : d
    );
    setItinerary({ ...itinerary, days });
  }

  function removeItem(dayIndex: number, itemIndex: number) {
    if (!itinerary) return;
    const days = itinerary.days.map((d, i) =>
      i === dayIndex ? { ...d, items: d.items.filter((_, j) => j !== itemIndex) } : d
    );
    setItinerary({ ...itinerary, days });
  }

  async function handleSave() {
    if (!itinerary) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itinerary.title,
          subtitle: itinerary.subtitle,
          tradition: itinerary.tradition,
          location,
          coverNote: itinerary.coverNote,
          startDate: startDate || undefined,
          prompt,
          days: itinerary.days,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save event");
      router.push(`/dashboard/${data.event.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  }

  if (step === "prompt") {
    return (
      <div className="rounded-2xl bg-white p-8 ring-1 ring-stone-200 shadow-sm">
        <label className="block text-sm font-medium text-stone-700">
          Describe your celebration
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. 3-day Hindu wedding in Jaipur for Anjali & Rohan, including Haldi, Mehendi, Sangeet and the wedding ceremony"
          className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={() => handleGenerate()}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700 transition-colors disabled:opacity-60"
        >
          {generating ? "Generating your itinerary…" : "✦ Generate with AI"}
        </button>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Or try an example
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleGenerate(p)}
                disabled={generating}
                className="text-left text-sm text-stone-600 rounded-lg px-3 py-2 hover:bg-stone-50 ring-1 ring-stone-200 disabled:opacity-60"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="space-y-6">
      {note && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          {note}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Title</label>
          <input
            value={itinerary.title}
            onChange={(e) => setItinerary({ ...itinerary, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Tradition / type</label>
            <input
              value={itinerary.tradition ?? ""}
              onChange={(e) => setItinerary({ ...itinerary, tradition: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, venue…"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Subtitle</label>
          <input
            value={itinerary.subtitle ?? ""}
            onChange={(e) => setItinerary({ ...itinerary, subtitle: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Welcome note to guests
          </label>
          <textarea
            value={itinerary.coverNote ?? ""}
            onChange={(e) => setItinerary({ ...itinerary, coverNote: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Start date (optional)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full sm:w-56 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      <div className="space-y-4">
        {itinerary.days.map((day, dayIndex) => (
          <div key={dayIndex} className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <input
                  value={day.title}
                  onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Day title"
                />
                <input
                  value={day.description ?? ""}
                  onChange={(e) => updateDay(dayIndex, { description: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Short description of the day"
                />
              </div>
              <button
                onClick={() => removeDay(dayIndex)}
                className="text-xs font-medium text-stone-400 hover:text-red-600 shrink-0"
              >
                Remove day
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {day.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="rounded-xl border border-stone-200 p-4 grid gap-2 sm:grid-cols-[100px_1fr_1fr] items-start"
                >
                  <input
                    value={item.time ?? ""}
                    onChange={(e) => updateItem(dayIndex, itemIndex, { time: e.target.value })}
                    placeholder="Time"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(dayIndex, itemIndex, { title: e.target.value })}
                    placeholder="Event title"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <input
                    value={item.location ?? ""}
                    onChange={(e) => updateItem(dayIndex, itemIndex, { location: e.target.value })}
                    placeholder="Location"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <input
                    value={item.dressCode ?? ""}
                    onChange={(e) => updateItem(dayIndex, itemIndex, { dressCode: e.target.value })}
                    placeholder="Dress code"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 sm:col-span-1"
                  />
                  <input
                    value={item.description ?? ""}
                    onChange={(e) =>
                      updateItem(dayIndex, itemIndex, { description: e.target.value })
                    }
                    placeholder="Description"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 sm:col-span-2"
                  />
                  <button
                    onClick={() => removeItem(dayIndex, itemIndex)}
                    className="text-xs font-medium text-stone-400 hover:text-red-600 sm:col-span-3 text-left"
                  >
                    Remove item
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(dayIndex)}
                className="text-sm font-medium text-rose-700 hover:underline"
              >
                + Add item
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addDay}
          className="w-full rounded-2xl border border-dashed border-stone-300 py-4 text-sm font-medium text-stone-600 hover:bg-white transition-colors"
        >
          + Add another day
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 pb-12">
        <button
          onClick={() => setStep("prompt")}
          className="text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          ← Start over
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save celebration"}
        </button>
      </div>
    </div>
  );
}
