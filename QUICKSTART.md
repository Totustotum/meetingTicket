# Quick Start Guide

Get your scheduling app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Firebase account (free)

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

Follow the detailed guide in `FIREBASE_SETUP.md`, or quick version:

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password
3. Create **Firestore Database** → Start in test mode
4. Copy config from Project Settings → Your apps → Web app

### 3. Add Environment Variables

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Set Firestore Rules

In Firebase Console → Firestore → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Run Locally

```bash
npm run dev
```

Open `http://localhost:5173` and test!

### 6. Deploy to GitHub Pages

1. Update `vite.config.ts` → change `base` to your repo name
2. Push to GitHub
3. Add Firebase secrets in repo Settings → Secrets
4. Push to `main` branch (auto-deploys via GitHub Actions)

Or deploy manually:

```bash
npm run deploy
```

## What's Next?

- ✅ App is ready to use!
- 📖 See `README.md` for full documentation
- 🔥 See `FIREBASE_SETUP.md` for detailed Firebase setup
