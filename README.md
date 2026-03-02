# Scheduling App

A web-based scheduling application built with React, TypeScript, and Firebase. Users can sign up/login, select available time slots, and schedule appointments that are stored in Firebase Firestore.

## Features

- 🔐 Firebase Authentication (email/password)
- 📅 Calendar date picker (Monday-start week)
- ⏰ Time slot selection (3pm, 4pm, 5pm, 6pm by default)
- ✅ Confirm → Enter Details → Schedule flow
- 🚫 Prevents double-booking using Firestore
- 📥 Download `.ics` calendar invite
- 🌐 Ready for GitHub Pages deployment

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password** provider
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in **test mode** (for development)
   - Set up security rules (see below)
5. Get your Firebase config:
   - Go to Project Settings > Your apps > Web app
   - Copy the config values

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase config values in `.env.local`:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firestore Security Rules

In Firebase Console > Firestore Database > Rules, use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 5. Firestore Indexes

No composite indexes needed for the current queries (they use simple `where` clauses).

## Development

```bash
npm run dev
```

Open `http://localhost:5173`

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

### 1. Update `vite.config.ts`

Change the `base` path to match your repository name:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // or '/' if using username.github.io
})
```

### 2. Set up GitHub Pages

1. Push your code to GitHub
2. Go to repository **Settings → Pages**
3. **Source:** Deploy from a branch
4. **Branch:** `gh-pages` (created by the workflow; do **not** use `main` or the site will be blank)
5. **Folder:** `/ (root)` → Save

**If the live site is blank:** Ensure Pages uses the **gh-pages** branch (not main). Add the six Firebase secrets under **Settings → Secrets and variables → Actions** so the workflow can build; then push a commit to re-run the workflow.

### 3. Deploy

```bash
npm run deploy
```

This will:
- Build your app
- Deploy to the `gh-pages` branch
- GitHub Pages will automatically serve it

### 4. Environment Variables for Production

For GitHub Pages, you'll need to set environment variables in your build process. Options:

**Option A: Use GitHub Secrets (for CI/CD)**
- Add secrets in repository Settings > Secrets
- Use a GitHub Action to build with secrets

**Option B: Use Vite's public env vars (less secure)**
- Rename `.env.local` variables to `VITE_PUBLIC_*` (not recommended for API keys)
- Or hardcode in `vite.config.ts` (not recommended)

**Option C: Use Firebase Hosting instead** (recommended for production)
- `firebase init hosting`
- `firebase deploy`

## Firebase Spark Plan (Free Tier)

This app uses only free Firebase features:
- ✅ Authentication (Email/Password)
- ✅ Cloud Firestore (1 GB storage, 50K reads/day, 20K writes/day)
- ❌ No Cloud Functions (not used)
- ❌ No paid Google Cloud APIs (not used)

## Project Structure

```
scheduling-app/
├── src/
│   ├── components/       # React components
│   │   ├── Auth.tsx
│   │   ├── Calendar.tsx
│   │   ├── TimeSlots.tsx
│   │   ├── DetailsForm.tsx
│   │   └── Success.tsx
│   ├── firebase/          # Firebase config
│   │   └── config.ts
│   ├── services/          # Firebase services
│   │   ├── auth.ts
│   │   └── firestore.ts
│   ├── utils/             # Utilities
│   │   ├── dateUtils.ts
│   │   ├── icsUtils.ts
│   │   └── validation.ts
│   ├── types.ts           # TypeScript types
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## License

MIT
Last updated: March 1, 2026