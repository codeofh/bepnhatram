import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryConstraint,
  CollectionReference,
  DocumentReference,
  WithFieldValue
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Hook for Firestore database operations with consistent configuration
 * This ensures every Firestore operation uses the same settings
 */
export const useFirestore = () => {
  // Check if Firestore is available
  const isFirestoreAvailable = typeof window !== 'undefined' && !!db;

  // Get document with proper settings
  const getDocument = async <T = DocumentData>(
    collectionName: string, 
    docId: string
  ): Promise<T | null> => {
    if (!isFirestoreAvailable) return null;
    
    try {
      const docRef = doc(db!, collectionName, docId);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as unknown as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  };

  // Query collection with proper settings
  const queryCollection = async <T = DocumentData>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ): Promise<T[]> => {
    if (!isFirestoreAvailable) return [];
    
    try {
      const collectionRef = collection(db!, collectionName);
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as unknown as T;
      });
    } catch (error) {
      console.error(`Error querying collection ${collectionName}:`, error);
      throw error;
    }
  };

  // Get all documents from a collection
  const getCollection = async <T = DocumentData>(
    collectionName: string
  ): Promise<T[]> => {
    if (!isFirestoreAvailable) return [];
    
    try {
      const collectionRef = collection(db!, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      return snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as unknown as T;
      });
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  };

  // Add or set document
  const setDocument = async <T extends WithFieldValue<DocumentData>>(
    collectionName: string,
    docId: string,
    data: T,
    merge = true
  ): Promise<void> => {
    if (!isFirestoreAvailable) throw new Error("Firestore is not available");
    
    try {
      const docRef = doc(db!, collectionName, docId);
      await setDoc(docRef, data, { merge });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  };

  // Update document fields
  const updateDocument = async (
    collectionName: string,
    docId: string,
    data: Partial<DocumentData>
  ): Promise<void> => {
    if (!isFirestoreAvailable) throw new Error("Firestore is not available");
    
    try {
      const docRef = doc(db!, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };

  // Delete document
  const deleteDocument = async (
    collectionName: string,
    docId: string
  ): Promise<void> => {
    if (!isFirestoreAvailable) throw new Error("Firestore is not available");
    
    try {
      const docRef = doc(db!, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  // Get collection reference
  const getCollectionRef = <T = DocumentData>(
    collectionName: string
  ): CollectionReference<T> | null => {
    if (!isFirestoreAvailable) return null;
    return collection(db!, collectionName) as CollectionReference<T>;
  };

  // Get document reference
  const getDocumentRef = <T = DocumentData>(
    collectionName: string,
    docId: string
  ): DocumentReference<T> | null => {
    if (!isFirestoreAvailable) return null;
    return doc(db!, collectionName, docId) as DocumentReference<T>;
  };

  return {
    getDocument,
    queryCollection,
    getCollection,
    setDocument,
    updateDocument,
    deleteDocument,
    getCollectionRef,
    getDocumentRef
  };
};