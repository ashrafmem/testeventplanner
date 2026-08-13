"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  time: string;
  title: string;
  location: string;
  dressCode: string;
  description: string;
};

type Day = {
  title: string;
  description: string;
  items: Item[];
};

type EventFormState = {
  title: string;
  subtitle: string;
  tradition: string;
  location: string;
  coverNote: string;
  startDate: string;
  days: Day[];
};

function emptyItem(): Item {
  return { time: "", title: "", location: "", dressCode: "", description: "" };
}

function emptyDay(): Day {
  return { title: "New day", description: "", items: [emptyItem()] };
}

export default function EventEditor({
  eventId,
  initial,
}: {
  eventId: string;
  initial: EventFormState;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormState>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDay(index: number, patch: Partial<Day>) {
    setForm((f) => ({
      ...f,
      days: f.days.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    }));
  }

  function updateItem(dayIndex: number, itemIndex: number, patch: Partial<Item>) {
    setForm((f) => ({
      ...f,
      days: f.days.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          items: d.items.map((it, j) => (j === itemIndex ? { ...it, ...patch } : it)),
        };
      }),
    }));
  }

  function addDay() {
    setForm((f) => ({ ...f, days: [...f.days, emptyDay()] }));
  }

  function removeDay(index: number) {
    setForm((f) => ({ ...f, days: f.days.filter((_, i) => i !== index) }));
  }

  function addItem(dayIndex: number) {
    setForm((f) => ({
      ...f,
      days: f.days.map((d, i) => (i === dayIndex ? { ...d, items: [...d.items, emptyItem()] } : d)),
    }));
  }

  function removeItem(dayIndex: number, itemIndex: number) {
    setForm((f) => ({
      ...f,
      days: f.days.map((d, i) =>
        i === dayIndex ? { ...d, items: d.items.filter((_, j) => j !== itemIndex) } : d
      ),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle,
          tradition: form.tradition,
          location: form.location,
          coverNote: form.coverNote,
          startDate: form.startDate || undefined,
          days: form.days,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save changes");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this celebration and all its RSVPs? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-stone-900">Event details</h2>
        <div>
          <label className="block text-sm font-medium text-stone-700">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Tradition / type</label>
            <input
              value={form.tradition}
              onChange={(e) => setForm({ ...form, tradition: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Subtitle</label>
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Welcome note to guests
          </label>
          <textarea
            value={form.coverNote}
            onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Start date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="mt-1 w-full sm:w-56 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      <div className="space-y-4">
        {form.days.map((day, dayIndex) => (
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
                  value={day.description}
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
                    value={item.time}
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
                    value={item.location}
                    onChange={(e) => updateItem(dayIndex, itemIndex, { location: e.target.value })}
                    placeholder="Location"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <input
                    value={item.dressCode}
                    onChange={(e) => updateItem(dayIndex, itemIndex, { dressCode: e.target.value })}
                    placeholder="Dress code"
                    className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <input
                    value={item.description}
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
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete celebration"}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
