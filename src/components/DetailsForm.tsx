import { useState, FormEvent, useEffect } from 'react';
import { formatFullDate, formatTimeMinutes, formatTime, getLocalTimeZoneLabel } from '../utils/dateUtils';
import { looksLikeEmail } from '../utils/validation';

interface DetailsFormProps {
  selectedDate: Date;
  selectedTime: number;
  durationMinutes: number;
  onSubmit: (name: string, email: string) => Promise<void>;
  onBack: () => void;
}

export function DetailsForm({
  selectedDate,
  selectedTime,
  durationMinutes,
  onSubmit,
  onBack,
}: DetailsFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Focus first field on mount
    const nameInput = document.getElementById('nameInput');
    if (nameInput) nameInput.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setGlobalError('');

    let ok = true;
    if (!name.trim()) {
      setNameError('Please enter your name.');
      ok = false;
    }
    if (!email.trim()) {
      setEmailError('Please enter your email.');
      ok = false;
    } else if (!looksLikeEmail(email.trim())) {
      setEmailError('Please enter a valid email.');
      ok = false;
    }
    if (!ok) return;

    setLoading(true);
    try {
      await onSubmit(name.trim(), email.trim());
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startDate = new Date(selectedDate);
  const h = Math.floor(selectedTime / 60);
  const m = selectedTime % 60;
  startDate.setHours(h, m, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  return (
    <form className="details" onSubmit={handleSubmit} noValidate>
      <div className="details__summary">
        {formatFullDate(selectedDate)} • {formatTimeMinutes(selectedTime)} – {formatTime(endDate)} •{' '}
        Time zone: {getLocalTimeZoneLabel()}
      </div>

      <label className="field">
        <span className="field__label">
          Name <span aria-hidden="true">*</span>
        </span>
        <input
          id="nameInput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          autoComplete="name"
        />
        {nameError && (
          <span className="field__error" role="alert">
            {nameError}
          </span>
        )}
      </label>

      <label className="field">
        <span className="field__label">
          Email <span aria-hidden="true">*</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        {emailError && (
          <span className="field__error" role="alert">
            {emailError}
          </span>
        )}
      </label>

      <div className="details__actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Event'}
        </button>
      </div>

      {globalError && (
        <div className="form-error" role="alert">
          {globalError}
        </div>
      )}
    </form>
  );
}
