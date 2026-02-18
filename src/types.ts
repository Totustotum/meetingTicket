export interface Booking {
  id: string;
  startsAtIso: string; // ISO string
  durationMinutes: number;
  name: string;
  email: string;
  userId: string; // Firebase Auth UID
  createdAtIso: string;
}

export type Step = 'select' | 'details' | 'success';

export interface TimeSlot {
  minutesFromMidnight: number;
}
