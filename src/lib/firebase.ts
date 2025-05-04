import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2qxym7nF9JNMMJ8KIcYYirjiw65W1x7U",
  authDomain: "bepnhatram-250504.firebaseapp.com",
  projectId: "bepnhatram-250504",
  storageBucket: "bepnhatram-250504.firebasestorage.app",
  messagingSenderId: "68632177652",
  appId: "1:68632177652:web:e7b70bdf3e974eea4167a1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };