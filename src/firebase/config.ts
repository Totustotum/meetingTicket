import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

function missingEnvKeys(): string[] {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const;

  return required.filter((k) => !import.meta.env[k] || String(import.meta.env[k]).trim() === '');
}

export const firebaseConfigMissingKeys = missingEnvKeys();

export let firebaseInitError: Error | null = null;
export let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (firebaseConfigMissingKeys.length) {
  firebaseInitError = new Error(
    `Firebase config missing: ${firebaseConfigMissingKeys.join(
      ', '
    )}. If this is GitHub Pages, add these as repository secrets and redeploy.`
  );
} else {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e: unknown) {
    firebaseInitError = e instanceof Error ? e : new Error(String(e));
  }
}

export default app;
