import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Check if we're not in production and use emulator
const useEmulator = process.env.NODE_ENV !== 'production' && process.env.USE_FIREBASE_EMULATORS === 'true';

// Initialize Firebase Admin
if (!getApps().length) {
  // If running locally, use service account credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bepnhatram-250504.appspot.com",
      });
    } catch (error) {
      console.error('Error initializing firebase admin with service account:', error);
      
      // Fallback to application default credentials
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
      });
    }
  } else {
    // In production environments like Vercel, use application default credentials
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
    });
  }
}

// Initialize Firestore, Auth, and Storage
const adminDb = getFirestore();
const adminAuth = getAuth();
const adminStorage = getStorage();

// Configure emulator connections if needed
if (useEmulator) {
  const emulatorHost = process.env.FIREBASE_EMULATOR_HOST || 'localhost';
  adminDb.settings({
    host: `${emulatorHost}:8080`,
    ssl: false,
  });
}

export { adminDb, adminAuth, adminStorage };