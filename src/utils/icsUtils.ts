import { Booking } from '../types';
import { toIcsDateTimeUtc, escapeIcsText } from './dateUtils';

const CONFIG = {
  title: 'Student Advising',
};

export function downloadIcs(booking: Booking): void {
  const dtStart = toIcsDateTimeUtc(new Date(booking.startsAtIso));
  const dtEnd = toIcsDateTimeUtc(
    new Date(new Date(booking.startsAtIso).getTime() + booking.durationMinutes * 60_000)
  );
  const uid = `${booking.id}@scheduling-app`;
  const now = toIcsDateTimeUtc(new Date());
  const summary = escapeIcsText(CONFIG.title);
  const description = escapeIcsText(`Booked by ${booking.name} (${booking.email}).`);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scheduling App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scheduled-event.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
