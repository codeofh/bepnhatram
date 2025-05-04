// Import the functions you need from the SDKs
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  connectAuthEmulator, 
  Auth 
} from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from "firebase/firestore";
import { 
  getStorage, 
  connectStorageEmulator, 
  FirebaseStorage 
} from "firebase/storage";

// Firebase configuration with environment variables and fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB2qxym7nF9JNMMJ8KIcYYirjiw65W1x7U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bepnhatram-250504.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bepnhatram-250504.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "68632177652",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:68632177652:web:e7b70bdf3e974eea4167a1"
};

// Initialize Firebase services with error handling and SSR safety
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let networkStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  wasEverOffline: false
};

// Track network status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('App is back online');
    networkStatus.isOnline = true;
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    networkStatus.isOnline = false;
    networkStatus.wasEverOffline = true;
  });
}

try {
  // Only initialize Firebase on the client-side
  if (typeof window !== "undefined") {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } else {
      app = getApp();
    }

    // Initialize Firebase services
    auth = getAuth(app);
    
    // Initialize Firestore with offline persistence
    try {
      // Use the newer initialization approach with persistent cache
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        }),
        experimentalForceLongPolling: true
      });
      
      console.log("Firestore initialized with persistent cache");
    } catch (firestoreInitError) {
      console.warn("Failed to initialize Firestore with persistence:", firestoreInitError);
      
      // Fallback to regular initialization
      db = getFirestore(app);
      
      // Try to enable offline persistence
      try {
        enableIndexedDbPersistence(db).then(() => {
          console.log("Offline persistence enabled successfully");
        }).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Offline persistence failed: Multiple tabs open');
          } else if (err.code === 'unimplemented') {
            console.warn('Offline persistence is not available in this browser');
          } else {
            console.error('Offline persistence error:', err);
          }
        });
      } catch (persistenceError) {
        console.warn("Could not enable offline persistence:", persistenceError);
      }
    }
    
    storage = getStorage(app);

    // Enable Firebase emulators in development environment
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
      try {
        const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "localhost";
        if (auth) connectAuthEmulator(auth, `http://${emulatorHost}:9099`);
        if (db) connectFirestoreEmulator(db, emulatorHost, 8080);
        if (storage) connectStorageEmulator(storage, emulatorHost, 9199);
        console.log("Firebase emulators connected");
      } catch (emulatorError) {
        console.error("Error connecting to Firebase emulators:", emulatorError);
      }
    }
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Export initialized services or null values for SSR
export { app, auth, db, storage, networkStatus };

// Utility function to check if Firebase is initialized
export const isFirebaseInitialized = (): boolean => {
  return typeof window !== "undefined" && app !== null && auth !== null && db !== null && storage !== null;
};

// Utility function to check if we're online and can perform Firestore operations
export const canPerformFirestoreOperations = (): boolean => {
  return isFirebaseInitialized() && networkStatus.isOnline;
};

// Function to attempt a Firestore operation with offline fallback
export const safeFirestoreOperation = async <T>(operation: () => Promise<T>, fallback: T = null as unknown as T): Promise<T> => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn("Firebase not initialized, cannot perform operation");
      return fallback;
    }
    
    return await operation();
  } catch (error: any) {
    // Check if it's an offline error
    if (error.message?.includes('offline') || error.code === 'unavailable' || error.code === 'failed-precondition') {
      console.warn("Operation failed due to network issues:", error);
      networkStatus.wasEverOffline = true;
      return fallback;
    }
    
    throw error;
  }
};