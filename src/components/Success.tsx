import { Booking } from '../types';
import { formatFullDate, formatTime, getLocalTimeZoneLabel } from '../utils/dateUtils';
import { downloadIcs } from '../utils/icsUtils';

interface SuccessProps {
  booking: Booking;
  onNewBooking: () => void;
}

export function Success({ booking, onNewBooking }: SuccessProps) {
  const startsAt = new Date(booking.startsAtIso);
  const endsAt = new Date(startsAt.getTime() + booking.durationMinutes * 60_000);

  const handleDownloadIcs = () => {
    downloadIcs(booking);
  };

  return (
    <div className="success">
      <h3 className="success__title">Scheduled!</h3>
      <p className="success__text">
        {booking.name}, you're booked for {formatFullDate(startsAt)} at {formatTime(startsAt)} –{' '}
        {formatTime(endsAt)} ({getLocalTimeZoneLabel()}).
      </p>
      <div className="success__actions">
        <button type="button" className="btn btn--primary" onClick={onNewBooking}>
          Schedule another
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleDownloadIcs}>
          Download .ics
        </button>
      </div>
    </div>
  );
}
