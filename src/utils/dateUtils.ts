export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatFullDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeMinutes(minutesFromMidnight: number): string {
  const d = new Date();
  d.setHours(0, minutesFromMidnight, 0, 0);
  return formatTime(d);
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function addMonths(d: Date, delta: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return startOfMonth(x);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getLocalTimeZoneLabel(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!tz) return 'Local time';
  return tz;
}

export interface CalendarDay {
  date: Date;
  isOutsideMonth: boolean;
}

/**
 * Build a 6-week calendar matrix starting on Monday.
 */
export function buildCalendarMatrix(viewMonth: Date): CalendarDay[] {
  const firstOfMonth = startOfMonth(viewMonth);
  const month = firstOfMonth.getMonth();

  // JS: Sunday=0..Saturday=6. We want Monday=0..Sunday=6
  const firstDow = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstDow);

  const out: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ date: startOfDay(d), isOutsideMonth: d.getMonth() !== month });
  }
  return out;
}

/**
 * Create an ISO string representing a local time on a given date.
 */
export function toIsoLocal(date: Date, minutesFromMidnight: number): string {
  const d = new Date(date);
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function toIcsDateTimeUtc(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    String(d.getUTCFullYear()) +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

export function escapeIcsText(s: string): string {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
