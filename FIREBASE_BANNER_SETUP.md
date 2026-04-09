# Firebase Banner Setup (GitHub Pages Friendly)

This project now supports a live, editable site banner via Firebase.

## 1) Create or open your Firebase project

1. Go to `https://console.firebase.google.com/`
2. Create a project (or use an existing one).
3. In **Project settings** -> **General** -> **Your apps**, add a **Web app**.
4. Copy the Firebase config values.

## 2) Add your project config to this site

1. Open `firebase-config.js`
2. Replace all `REPLACE_ME` values with your real project values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
3. Commit and push to GitHub.

## 3) Enable staff login (email/password)

1. Firebase Console -> **Authentication** -> **Get started**
2. Sign-in method -> enable **Email/Password**
3. Go to **Users** and add each staff member email/password

## 4) Enable Firestore database

1. Firebase Console -> **Firestore Database** -> **Create database**
2. Start in Production mode (recommended)
3. Choose your nearest region

## 5) Set Firestore security rules

Use these rules so everyone can read the banner, but only signed-in staff can edit it:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site/banner {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Publish the rules.

## 6) How staff edit the banner

1. Open `admin-portal.html`
2. Sign in with their Firebase staff email/password
3. In `admin-console.html`, update:
   - Banner heading
   - Banner message
   - Show/hide toggle
   - Optional start and end date/time
4. Click **Save banner**

The top banner on all site pages updates using the same existing theme/styles.

## Optional tightening

If you want only your own domain emails to edit, replace the write rule with:

```txt
allow write: if request.auth != null
  && request.auth.token.email.matches('.*@yourdomain\\.com$');
```
