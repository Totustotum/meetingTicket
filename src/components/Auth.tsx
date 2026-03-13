import { useState, FormEvent } from 'react';
import { signIn, signUp, resetPassword } from '../services/auth';

interface AuthProps {
  onAuthSuccess: () => void;
}

type AuthView = 'signin' | 'signup' | 'forgot';

export function Auth({ onAuthSuccess }: AuthProps) {
  const [view, setView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (view === 'signup') {
        await signUp(email, password);
      } else if (view === 'signin') {
        await signIn(email, password);
      } else {
        await resetPassword(email);
        setMessage(
          'If an account exists for that email, you’ll receive a reset link. Check spam/junk and use the exact email you signed up with.'
        );
        setView('signin');
      }
      if (view !== 'forgot') {
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'forgot') {
    return (
      <div className="auth-card">
        <h1 className="auth-card__title">Reset password</h1>
        <p className="auth-card__subtitle">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form className="auth-card__form" onSubmit={handleSubmit}>
          {error && <div className="auth-card__error">{error}</div>}
          {message && <div className="auth-card__message">{message}</div>}

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

          <div className="auth-card__actions">
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setView('signin');
                clearMessages();
              }}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Student Advising Scheduler</h1>
      <div className="auth-card__tabs">
        <button
          type="button"
          className={`auth-card__tab ${view === 'signin' ? 'active' : ''}`}
          onClick={() => {
            setView('signin');
            clearMessages();
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-card__tab ${view === 'signup' ? 'active' : ''}`}
          onClick={() => {
            setView('signup');
            clearMessages();
          }}
        >
          Sign Up
        </button>
      </div>

      <form className="auth-card__form" onSubmit={handleSubmit}>
        {error && <div className="auth-card__error">{error}</div>}
        {message && <div className="auth-card__message">{message}</div>}

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
            autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
          />
        </label>

        {view === 'signin' && (
          <div className="auth-card__forgot">
            <button
              type="button"
              className="auth-card__forgot-link"
              onClick={() => {
                setView('forgot');
                clearMessages();
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <div className="auth-card__actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Please wait...' : view === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
