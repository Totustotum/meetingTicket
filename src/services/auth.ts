import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth, firebaseInitError } from '../firebase/config';

function requireAuth() {
  if (firebaseInitError) throw firebaseInitError;
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  return auth;
}

export async function signUp(email: string, password: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(requireAuth(), email, password);
  return userCredential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return userCredential.user;
}

export async function logOut(): Promise<void> {
  await signOut(requireAuth());
}
