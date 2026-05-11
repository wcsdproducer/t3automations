import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // In Firebase App Hosting, this picks up the default service account automatically.
    // For local dev, you'll need GOOGLE_APPLICATION_CREDENTIALS set if testing this path.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();
export { admin, db };
