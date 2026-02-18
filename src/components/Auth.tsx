import { useState, FormEvent } from 'react';
import { signIn, signUp } from '../services/auth';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Student Advising Scheduler</h1>
      <div className="auth-card__tabs">
        <button
          type="button"
          className={`auth-card__tab ${!isSignUp ? 'active' : ''}`}
          onClick={() => {
            setIsSignUp(false);
            setError('');
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-card__tab ${isSignUp ? 'active' : ''}`}
          onClick={() => {
            setIsSignUp(true);
            setError('');
          }}
        >
          Sign Up
        </button>
      </div>

      <form className="auth-card__form" onSubmit={handleSubmit}>
        {error && <div className="auth-card__error">{error}</div>}

        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={6}
          />
        </label>

        <div className="auth-card__actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
