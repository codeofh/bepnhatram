// Chỉ import adminDb trong môi trường server
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  where,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { MediaItem } from "./mediaLibrary";

// Collection name for media items
const MEDIA_COLLECTION = "media";

// Server-side functions for Firestore operations
export const serverAddMediaItem = async (item: MediaItem) => {
  try {
    // Chỉ import adminDb trong môi trường server
    const { adminDb } = await import("./firebase-admin");
    
    const docRef = await adminDb.collection(MEDIA_COLLECTION).add({
      ...item,
      createdAt: new Date(), // Ensure date is properly stored
    });
    
    return {
      ...item,
      id: docRef.id, // Use Firestore document ID as the media item ID
    };
  } catch (error) {
    console.error("Error adding media item to Firestore:", error);
    throw error;
  }
};

export const serverGetMediaItems = async () => {
  try {
    // Chỉ import adminDb trong môi trường server
    const { adminDb } = await import("./firebase-admin");
    
    const snapshot = await adminDb
      .collection(MEDIA_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to Date
    })) as MediaItem[];
  } catch (error) {
    console.error("Error getting media items from Firestore:", error);
    throw error;
  }
};

export const serverGetMediaItemsBySource = async (source: "local" | "cloudinary") => {
  try {
    // Chỉ import adminDb trong môi trường server
    const { adminDb } = await import("./firebase-admin");
    
    const snapshot = await adminDb
      .collection(MEDIA_COLLECTION)
      .where("source", "==", source)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to Date
    })) as MediaItem[];
  } catch (error) {
    console.error(`Error getting ${source} media items from Firestore:`, error);
    throw error;
  }
};

export const serverUpdateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
  try {
    // Chỉ import adminDb trong môi trường server
    const { adminDb } = await import("./firebase-admin");
    
    await adminDb.collection(MEDIA_COLLECTION).doc(id).update(updates);
    return true;
  } catch (error) {
    console.error("Error updating media item in Firestore:", error);
    throw error;
  }
};

export const serverDeleteMediaItem = async (id: string) => {
  try {
    // Chỉ import adminDb trong môi trường server
    const { adminDb } = await import("./firebase-admin");
    
    await adminDb.collection(MEDIA_COLLECTION).doc(id).delete();
    return true;
  } catch (error) {
    console.error("Error deleting media item from Firestore:", error);
    throw error;
  }
};

// Client-side functions for Firestore operations
export const clientAddMediaItem = async (item: MediaItem) => {
  try {
    if (!db) throw new Error("Firestore not initialized");
    
    const docRef = await addDoc(collection(db, MEDIA_COLLECTION), {
      ...item,
      createdAt: new Date(), // Ensure date is properly stored
    });
    
    return {
      ...item,
      id: docRef.id, // Use Firestore document ID as the media item ID
    };
  } catch (error) {
    console.error("Error adding media item to Firestore:", error);
    throw error;
  }
};

export const clientGetMediaItems = async () => {
  try {
    if (!db) throw new Error("Firestore not initialized");
    
    const q = query(
      collection(db, MEDIA_COLLECTION),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to Date
    })) as MediaItem[];
  } catch (error) {
    console.error("Error getting media items from Firestore:", error);
    throw error;
  }
};

export const clientGetMediaItemsBySource = async (source: "local" | "cloudinary") => {
  try {
    if (!db) throw new Error("Firestore not initialized");
    
    const q = query(
      collection(db, MEDIA_COLLECTION),
      where("source", "==", source),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to Date
    })) as MediaItem[];
  } catch (error) {
    console.error(`Error getting ${source} media items from Firestore:`, error);
    throw error;
  }
};

export const clientUpdateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
  try {
    if (!db) throw new Error("Firestore not initialized");
    
    await updateDoc(doc(db, MEDIA_COLLECTION, id), updates);
    return true;
  } catch (error) {
    console.error("Error updating media item in Firestore:", error);
    throw error;
  }
};

export const clientDeleteMediaItem = async (id: string) => {
  try {
    if (!db) throw new Error("Firestore not initialized");
    
    await deleteDoc(doc(db, MEDIA_COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Error deleting media item from Firestore:", error);
    throw error;
  }
};