import NewEventWizard from "@/components/NewEventWizard";

export default function NewEventPage() {
  return (
    <div className="flex-1 bg-stone-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-stone-900">
          Plan a new celebration
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Describe it in plain language — the AI will draft a full itinerary
          that you can edit before sharing with guests.
        </p>
        <div className="mt-8">
          <NewEventWizard />
        </div>
      </div>
    </div>
  );
}
