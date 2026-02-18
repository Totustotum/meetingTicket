import { buildCalendarMatrix, formatMonthYear, isSameDay, startOfDay } from '../utils/dateUtils';

interface CalendarProps {
  viewMonth: Date;
  selectedDate: Date;
  minDate: Date;
  onMonthChange: (delta: number) => void;
  onDateSelect: (date: Date, isOutsideMonth?: boolean) => void;
}

export function Calendar({
  viewMonth,
  selectedDate,
  minDate,
  onMonthChange,
  onDateSelect,
}: CalendarProps) {
  const matrix = buildCalendarMatrix(viewMonth);
  const today = startOfDay(new Date());

  return (
    <section className="panel panel--calendar" aria-label="Calendar">
      <div className="cal-header">
        <div className="cal-header__left">
          <div className="cal-header__month" aria-live="polite">
            {formatMonthYear(viewMonth)}
          </div>
        </div>
        <div className="cal-header__nav" aria-label="Change month">
          <button
            className="icon-btn"
            type="button"
            aria-label="Previous month"
            title="Previous month"
            onClick={() => onMonthChange(-1)}
          >
            ‹
          </button>
          <button
            className="icon-btn"
            type="button"
            aria-label="Next month"
            title="Next month"
            onClick={() => onMonthChange(1)}
          >
            ›
          </button>
        </div>
      </div>

      <div className="cal-grid" role="grid" aria-label="Calendar grid">
        <div className="cal-dow" aria-hidden="true">
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>Su</div>
        </div>
        <div className="cal-days">
          {matrix.map((day, idx) => {
            const isToday = isSameDay(day.date, today);
            const isSelected = isSameDay(day.date, selectedDate);
            const isDisabled = day.date < minDate;

            return (
              <button
                key={idx}
                type="button"
                className={`day-btn ${day.isOutsideMonth ? 'is-outside' : ''} ${
                  isToday ? 'is-today' : ''
                } ${isSelected ? 'is-selected' : ''}`}
                aria-disabled={isDisabled}
                aria-label={`${day.date.toLocaleDateString()}${isDisabled ? ', unavailable' : ''}${
                  isSelected ? ', selected' : ''
                }`}
                onClick={() => {
                  if (!isDisabled) {
                    onDateSelect(day.date, day.isOutsideMonth);
                  }
                }}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
