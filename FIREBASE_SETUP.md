# Firebase Setup Guide

This guide will help you set up Firebase for the scheduling app using the **free Spark plan** (no credit card required).

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "scheduling-app")
4. **Disable Google Analytics** (optional, not needed for free tier)
5. Click **"Create project"**

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **"Get started"** if prompted
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Enable **"Email/Password"** (first toggle)
6. **Disable** "Email link (passwordless sign-in)" - we don't need it
7. Click **"Save"**

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules next)
4. Choose a location (pick the closest to your users, e.g., `us-central`)
5. Click **"Enable"**

## Step 4: Set Up Security Rules

1. In Firestore Database, go to the **"Rules"** tab
2. Copy the contents from `firestore.rules` in this project
3. Paste into the rules editor
4. Click **"Publish"**

The rules allow:
- ✅ Authenticated users to read all bookings (to check availability)
- ✅ Users to create bookings only with their own `userId`
- ✅ Users to update/delete only their own bookings

## Step 5: Get Firebase Config

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register app with a nickname (e.g., "Scheduling Web App")
6. **Do NOT** check "Also set up Firebase Hosting" (we're using GitHub Pages)
7. Click **"Register app"**
8. Copy the `firebaseConfig` object values

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 6: Add Config to Your App

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **Never commit `.env.local`** - it's already in `.gitignore`

## Step 7: Test Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173`
4. Try signing up with a test email
5. Create a booking

## Step 8: Set Up for GitHub Pages Deployment

For GitHub Pages, you need to add Firebase config as **GitHub Secrets**:

1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically use these secrets when building.

## Free Tier Limits (Spark Plan)

✅ **Included (no credit card):**
- Authentication: Unlimited users
- Firestore: 
  - 1 GB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day

❌ **Not used (so no charges):**
- Cloud Functions
- Cloud Storage
- Cloud Messaging
- Paid Google Cloud APIs

For a small scheduling app, these limits are more than enough!

## Troubleshooting

### "Firebase: Error (auth/operation-not-allowed)"
- Make sure Email/Password is enabled in Authentication > Sign-in method

### "Missing or insufficient permissions"
- Check Firestore security rules are published
- Make sure user is authenticated (check Auth state)

### "Firebase App named '[DEFAULT]' already exists"
- This usually means Firebase is initialized twice. Check `src/firebase/config.ts` is only imported once.

### Environment variables not working
- Make sure `.env.local` exists (not just `.env.example`)
- Restart dev server after changing `.env.local`
- Variables must start with `VITE_` to be exposed to the browser
