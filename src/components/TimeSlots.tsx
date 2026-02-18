import { TimeSlot } from '../types';
import { formatTimeMinutes } from '../utils/dateUtils';

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: number | null;
  bookedSlots: Set<string>;
  onSlotSelect: (minutesFromMidnight: number) => void;
}

export function TimeSlots({ slots, selectedTime, bookedSlots, onSlotSelect }: TimeSlotsProps) {
  if (slots.length === 0) {
    return (
      <div className="slots">
        <div className="empty">No slots available for this day.</div>
      </div>
    );
  }

  return (
    <div className="slots" aria-label="Available time slots">
      {slots.map((slot) => {
        const slotKey = String(slot.minutesFromMidnight);
        const isBooked = bookedSlots.has(slotKey);
        const isSelected = selectedTime === slot.minutesFromMidnight;

        return (
          <button
            key={slot.minutesFromMidnight}
            type="button"
            className={`slot-btn ${isSelected ? 'is-selected' : ''}`}
            disabled={isBooked}
            title={isBooked ? 'Already booked' : undefined}
            onClick={() => !isBooked && onSlotSelect(slot.minutesFromMidnight)}
          >
            {formatTimeMinutes(slot.minutesFromMidnight)}
          </button>
        );
      })}
    </div>
  );
}
