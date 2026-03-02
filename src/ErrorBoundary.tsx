import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      const isConfig =
        /configuration|api key|firebase|invalid.*config/i.test(this.state.message) ||
        !import.meta.env.VITE_FIREBASE_PROJECT_ID;
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 480,
            margin: '40px auto',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            background: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Something went wrong</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            {isConfig
              ? 'Firebase is not configured for this build. If this is the live site, add the repository secrets (Settings → Secrets and variables → Actions) and redeploy.'
              : this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
