import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import { Auth } from './components/Auth';
import { Calendar } from './components/Calendar';
import { TimeSlots } from './components/TimeSlots';
import { DetailsForm } from './components/DetailsForm';
import { Success } from './components/Success';
import { Step, Booking, TimeSlot } from './types';
import {
  startOfDay,
  startOfMonth,
  addMonths,
  toIsoLocal,
  formatFullDate,
  formatTimeMinutes,
  getLocalTimeZoneLabel,
} from './utils/dateUtils';
import { saveBooking, isSlotBooked, getAllBookings } from './services/firestore';
import { logOut } from './services/auth';

const CONFIG = {
  title: 'Student Advising',
  durationMinutes: 15,
  slotStartHour: 15, // 3:00 PM
  slotEndHourInclusive: 18, // 6:00 PM
  slotStepMinutes: 60,
  minDate: startOfDay(new Date()),
};

function getSlotsForDate(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = CONFIG.slotStartHour * 60;
  const end = CONFIG.slotEndHourInclusive * 60;
  for (let m = start; m <= end; m += CONFIG.slotStepMinutes) {
    slots.push({ minutesFromMidnight: m });
  }

  // If selected date is today, hide slots that are already in the past
  const today = startOfDay(new Date());
  if (date.getTime() === today.getTime()) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter((s) => s.minutesFromMidnight > nowMinutes);
  }
  return slots;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('select');
  const [viewMonth, setViewMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [lastBooked, setLastBooked] = useState<Booking | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && step === 'select') {
      // Load booked slots for availability checking
      getAllBookings()
        .then((bookings) => {
          const booked = new Set<string>();
          bookings.forEach((b) => {
            const slotDate = startOfDay(new Date(b.startsAtIso));
            if (slotDate.getTime() === selectedDate.getTime()) {
              const slotTime = new Date(b.startsAtIso);
              const minutes = slotTime.getHours() * 60 + slotTime.getMinutes();
              booked.add(String(minutes));
            }
          });
          setBookedSlots(booked);
        })
        .catch(console.error);
    }
  }, [user, selectedDate, step]);

  const handleDateSelect = (date: Date, isOutsideMonth?: boolean) => {
    setSelectedDate(startOfDay(date));
    setSelectedTime(null);
    // If clicking outside month, navigate to that month
    if (isOutsideMonth) {
      const clickedMonth = new Date(date);
      clickedMonth.setDate(1);
      setViewMonth(clickedMonth);
    }
    setStep('select');
  };

  const handleSlotSelect = (minutesFromMidnight: number) => {
    setSelectedTime(minutesFromMidnight);
  };

  const handleNext = () => {
    if (selectedTime != null) {
      setStep('details');
    }
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleSchedule = async (name: string, email: string) => {
    if (!user || selectedTime == null) return;

    const startsAtIso = toIsoLocal(selectedDate, selectedTime);

    // Double-check slot availability
    const alreadyBooked = await isSlotBooked(startsAtIso);
    if (alreadyBooked) {
      throw new Error('That time was just booked. Please go back and pick another slot.');
    }

    const booking: Omit<Booking, 'id'> = {
      startsAtIso,
      durationMinutes: CONFIG.durationMinutes,
      name,
      email,
      userId: user.uid,
      createdAtIso: new Date().toISOString(),
    };

    const id = await saveBooking(booking);
    setLastBooked({ ...booking, id });
    setStep('success');
  };

  const handleNewBooking = () => {
    setSelectedTime(null);
    setLastBooked(null);
    setStep('select');
  };

  const handleLogout = async () => {
    await logOut();
    setStep('select');
    setSelectedTime(null);
    setLastBooked(null);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <div className="card__body" style={{ padding: '40px', textAlign: 'center' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <Auth onAuthSuccess={() => {}} />
      </div>
    );
  }

  const slots = getSlotsForDate(selectedDate);
  const stepTitle =
    step === 'select'
      ? 'Select a Date & Time'
      : step === 'details'
        ? 'Enter Details'
        : 'Scheduled';

  return (
    <div className="page">
      <a className="skip-link" href="#app">
        Skip to content
      </a>

      <header className="topbar">
        <div className="brand">
          <div className="brand__kicker">Totus Totum</div>
          <div className="brand__title">{CONFIG.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="pill" aria-label="Session duration">
            <span className="pill__dot" aria-hidden="true"></span>
            <span>15 min session</span>
          </div>
          <div className="user-info">
            <span className="user-info__email">{user.email}</span>
            <button
              type="button"
              className="btn btn--ghost user-info__btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main id="app" className="card" aria-live="polite">
        <div className="card__header">
          <h2 className="card__title">{stepTitle}</h2>
        </div>

        <div className="card__body">
          <Calendar
            viewMonth={viewMonth}
            selectedDate={selectedDate}
            minDate={CONFIG.minDate}
            onMonthChange={(delta) => setViewMonth(addMonths(viewMonth, delta))}
            onDateSelect={handleDateSelect}
          />

          <section className="panel panel--slots" aria-label="Scheduling">
            <div className="slots-header">
              <div className="slots-header__date">
                <div className="slots-header__big">{formatFullDate(selectedDate)}</div>
                <div className="slots-header__sub">
                  Your local time ({getLocalTimeZoneLabel()})
                </div>
              </div>
              {step === 'select' && selectedTime != null && (
                <div className="confirm-bar">
                  <div className="confirm-bar__time">
                    {formatTimeMinutes(selectedTime)}
                  </div>
                  <button type="button" className="btn btn--primary" onClick={handleNext}>
                    Next
                  </button>
                </div>
              )}
            </div>

            {step === 'select' && (
              <TimeSlots
                slots={slots}
                selectedTime={selectedTime}
                bookedSlots={bookedSlots}
                onSlotSelect={handleSlotSelect}
              />
            )}

            {step === 'details' && selectedTime != null && (
              <DetailsForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                durationMinutes={CONFIG.durationMinutes}
                onSubmit={handleSchedule}
                onBack={handleBack}
              />
            )}

            {step === 'success' && lastBooked && (
              <Success booking={lastBooked} onNewBooking={handleNewBooking} />
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer__hint">
          Bookings are stored securely in Firebase Firestore.
        </div>
      </footer>
    </div>
  );
}
