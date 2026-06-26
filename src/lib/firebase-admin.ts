import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // In Firebase App Hosting, this picks up the default service account automatically.
    // For local dev, we explicitly configure the project ID to avoid connecting to the wrong database.
    const config: admin.AppOptions = {
      storageBucket: 'studio-1410114603-9e1f6.firebasestorage.app'
    };
    if (process.env.NODE_ENV === 'development') {
      config.projectId = 'studio-1410114603-9e1f6';
    }
    admin.initializeApp(config);
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();
export { admin, db };
