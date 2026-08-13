"use client";

import { useState } from "react";

type RsvpRow = {
  id: string;
  guestName: string;
  status: string;
  guestCount: number;
  dietary: string | null;
  message: string | null;
  email: string | null;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  yes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  no: "bg-stone-100 text-stone-500 ring-stone-200",
  maybe: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function RsvpPanel({
  rsvpUrl,
  stats,
  rsvps,
}: {
  rsvpUrl: string;
  stats: { yes: number; no: number; maybe: number; totalGuests: number };
  rsvps: RsvpRow[];
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(rsvpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-200 shadow-sm space-y-6">
      <div>
        <p className="text-sm font-medium text-stone-700">Guest RSVP link</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            readOnly
            value={rsvpUrl}
            className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-600"
          />
          <button
            onClick={copyLink}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 transition-colors shrink-0"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Attending" value={stats.yes} />
        <StatCard label="Not attending" value={stats.no} />
        <StatCard label="Maybe" value={stats.maybe} />
        <StatCard label="Total guests" value={stats.totalGuests} highlight />
      </div>

      {rsvps.length > 0 && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Responses</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rsvps.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900 text-sm">{r.guestName}</span>
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ring-1 ${STATUS_STYLES[r.status] ?? ""}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.status !== "no" && (
                    <p className="text-xs text-stone-500 mt-1">
                      {r.guestCount} guest{r.guestCount === 1 ? "" : "s"}
                      {r.dietary ? ` · Dietary: ${r.dietary}` : ""}
                    </p>
                  )}
                  {r.message && (
                    <p className="text-sm text-stone-600 mt-1 italic">&ldquo;{r.message}&rdquo;</p>
                  )}
                </div>
                <span className="text-xs text-stone-400 shrink-0">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${highlight ? "bg-rose-50 ring-1 ring-rose-200" : "bg-stone-50"}`}
    >
      <p className="text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}
