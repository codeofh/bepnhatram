// Import the functions you need from the SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with environment variables and fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB2qxym7nF9JNMMJ8KIcYYirjiw65W1x7U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bepnhatram-250504.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bepnhatram-250504",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bepnhatram-250504.appspot.com", // Corrected storage bucket
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "68632177652",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:68632177652:web:e7b70bdf3e974eea4167a1"
};

// Initialize Firebase only on the client side
const app = typeof window !== "undefined" ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = typeof window !== "undefined" ? getAuth(app) : null;
const db = typeof window !== "undefined" ? getFirestore(app) : null;
const storage = typeof window !== "undefined" ? getStorage(app) : null;

export { app, auth, db, storage };