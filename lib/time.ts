const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

export function parseDateSafely(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function clampElapsedMs(date: Date | null, now = Date.now()): number | null {
  if (!date) {
    return null;
  }

  const elapsed = now - date.getTime();

  if (!Number.isFinite(elapsed)) {
    return null;
  }

  return Math.max(0, elapsed);
}

export function formatDurationParts(durationMs: number | null) {
  if (durationMs === null || durationMs < 0) {
    return null;
  }

  const days = Math.floor(durationMs / DAY_IN_MS);
  const hours = Math.floor((durationMs % DAY_IN_MS) / HOUR_IN_MS);
  const minutes = Math.floor((durationMs % HOUR_IN_MS) / MINUTE_IN_MS);
  const seconds = Math.floor((durationMs % MINUTE_IN_MS) / SECOND_IN_MS);

  return { days, hours, minutes, seconds };
}

export function formatDuration(durationMs: number | null): string {
  const parts = formatDurationParts(durationMs);

  if (!parts) {
    return "Sin eventos recientes";
  }

  const { days, hours, minutes, seconds } = parts;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function formatSpanishDate(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = parseDateSafely(value);

  if (!parsed) {
    return "Sin dato disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    ...options
  }).format(parsed);
}

export function isValidUrl(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
