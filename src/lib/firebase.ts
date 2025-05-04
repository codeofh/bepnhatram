// Import the functions you need from the SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration with environment variables and fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB2qxym7nF9JNMMJ8KIcYYirjiw65W1x7U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bepnhatram-250504.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bepnhatram-250504.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "68632177652",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:68632177652:web:e7b70bdf3e974eea4167a1"
};

// Initialize Firebase services with error handling and SSR safety
let app;
let auth;
let db;
let storage;

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
    db = getFirestore(app);
    storage = getStorage(app);

    // Enable Firebase emulators in development environment
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
      try {
        const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "localhost";
        connectAuthEmulator(auth, `http://${emulatorHost}:9099`);
        connectFirestoreEmulator(db, emulatorHost, 8080);
        connectStorageEmulator(storage, emulatorHost, 9199);
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
export { app, auth, db, storage };

// Utility function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return typeof window !== "undefined" && app && auth && db && storage;
};