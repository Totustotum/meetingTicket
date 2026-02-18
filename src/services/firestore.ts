import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Booking } from '../types';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Save a booking to Firestore
 */
export async function saveBooking(booking: Omit<Booking, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...booking,
    createdAt: Timestamp.fromDate(new Date(booking.createdAtIso)),
    startsAt: Timestamp.fromDate(new Date(booking.startsAtIso)),
  });
  return docRef.id;
}

/**
 * Check if a time slot is already booked
 */
export async function isSlotBooked(startsAtIso: string): Promise<boolean> {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('startsAtIso', '==', startsAtIso)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      startsAtIso: data.startsAtIso,
      durationMinutes: data.durationMinutes,
      name: data.name,
      email: data.email,
      userId: data.userId,
      createdAtIso: data.createdAtIso,
    } as Booking;
  });
}

/**
 * Get all bookings (for checking availability)
 */
export async function getAllBookings(): Promise<Booking[]> {
  const snapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      startsAtIso: data.startsAtIso,
      durationMinutes: data.durationMinutes,
      name: data.name,
      email: data.email,
      userId: data.userId,
      createdAtIso: data.createdAtIso,
    } as Booking;
  });
}
