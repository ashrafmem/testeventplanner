import { headers } from "next/headers";

// Builds an absolute URL for the current request, so server components can
// hand fully-qualified links (e.g. the RSVP link) to client components
// without needing client-side state just to read window.location.
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
