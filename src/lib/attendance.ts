const ISO_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:\d{2})?)?$/i;

function parseTimestamp(value: string): number {
  const match = ISO_TIMESTAMP.exec(value);
  if (!match) throw new RangeError(`Invalid timestamp: ${value}`);

  const [, year, month, day, hour, minute, second, , timezone] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1];
  const monthLength = numericMonth === 2 &&
    (numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0))
    ? 29
    : daysInMonth;
  if (
    numericMonth < 1 ||
    numericMonth > 12 ||
    Number(day) < 1 ||
    Number(day) > monthLength ||
    (hour !== undefined && Number(hour) > 23) ||
    (minute !== undefined && Number(minute) > 59) ||
    (second !== undefined && Number(second) > 59)
  ) {
    throw new RangeError(`Invalid timestamp: ${value}`);
  }

  if (timezone && timezone.toUpperCase() !== "Z") {
    const offset = timezone.slice(1).split(":").map(Number);
    if (offset[0] > 23 || offset[1] > 59) {
      throw new RangeError(`Invalid timestamp: ${value}`);
    }
  }

  const normalized = hour !== undefined && !timezone ? `${value}Z` : value;
  const milliseconds = Date.parse(normalized);
  if (!Number.isFinite(milliseconds)) throw new RangeError(`Invalid timestamp: ${value}`);
  return milliseconds;
}

export function calculateLateness(
  scheduledStart: string,
  firstJoin: string | null,
  graceMinutes: number,
): { rawMinutes: number; countedMinutes: number } {
  const scheduledAt = parseTimestamp(scheduledStart);
  if (!Number.isFinite(graceMinutes) || graceMinutes < 0) {
    throw new RangeError("Grace minutes must be a non-negative finite number");
  }

  const rawMinutes = firstJoin === null
    ? 0
    : Math.max(0, (parseTimestamp(firstJoin) - scheduledAt) / 60_000);

  return { rawMinutes, countedMinutes: Math.max(0, rawMinutes - graceMinutes) };
}

export function confirmedConnectedMinutes(intervals: { start: string; end: string }[]): number {
  const parsed = intervals.map(({ start, end }) => {
    const startAt = parseTimestamp(start);
    const endAt = parseTimestamp(end);
    if (endAt < startAt) throw new RangeError("Interval end must not precede its start");
    return [startAt, endAt] as const;
  }).sort((a, b) => a[0] - b[0]);

  let totalMilliseconds = 0;
  let rangeStart: number | undefined;
  let rangeEnd: number | undefined;

  for (const [start, end] of parsed) {
    if (rangeStart === undefined || rangeEnd === undefined) {
      rangeStart = start;
      rangeEnd = end;
    } else if (start <= rangeEnd) {
      rangeEnd = Math.max(rangeEnd, end);
    } else {
      totalMilliseconds += rangeEnd - rangeStart;
      rangeStart = start;
      rangeEnd = end;
    }
  }

  if (rangeStart !== undefined && rangeEnd !== undefined) {
    totalMilliseconds += rangeEnd - rangeStart;
  }
  return totalMilliseconds / 60_000;
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  const safeText = typeof value === "string" && /^[\u0000-\u0020\uFEFF]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
