export type SessionUser = {
  id: string;
  email: string;
};

function decodeSegment(segment: string): unknown {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  return JSON.parse(json);
}

// Display only; the server verifies the signature on every request.
export function getSessionUser(): SessionUser | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) return null;

  try {
    const payload = decodeSegment(payloadSegment) as { sub?: unknown; email?: unknown };

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function initialsFor(email: string): string {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }

  return name.slice(0, 2).toUpperCase() || "?";
}
