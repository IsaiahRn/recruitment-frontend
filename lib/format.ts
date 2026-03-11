export function formatDate(value?: unknown): string {
  const date = normalizeDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(value?: unknown): string {
  const date = normalizeDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatStatus(value?: string | null): string {
  if (!value) return "-";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeDate(value?: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    return fromEpoch(value);
  }

  if (typeof value === "bigint") {
    return fromEpoch(Number(value));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      return fromEpoch(Number(trimmed));
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;

    // Spring/Jackson sometimes sends structured timestamp objects
    if (
      typeof source.seconds === "number" &&
      typeof source.nanos === "number"
    ) {
      return new Date(source.seconds * 1000 + Math.floor(source.nanos / 1_000_000));
    }

    if (typeof source.seconds === "number") {
      return new Date(source.seconds * 1000);
    }

    if (typeof source.epochSecond === "number") {
      return new Date(source.epochSecond * 1000);
    }

    if (typeof source.time === "number") {
      return new Date(source.time);
    }

    if (typeof source.valueOf === "function") {
      const primitive = source.valueOf();
      if (primitive !== value) {
        return normalizeDate(primitive);
      }
    }
  }

  return null;
}

function fromEpoch(raw: number): Date | null {
  if (!Number.isFinite(raw)) return null;

  const millis = raw < 1_000_000_000_000 ? raw * 1000 : raw;
  const parsed = new Date(millis);
  return isNaN(parsed.getTime()) ? null : parsed;
}
