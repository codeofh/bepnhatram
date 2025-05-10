import { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { MediaItem } from "@/lib/mediaLibrary";

// Collection name for media items
const MEDIA_COLLECTION = "media";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getMediaItems(req, res);
    case "POST":
      return addMediaItem(req, res);
    case "PUT":
      return updateMediaItem(req, res);
    case "DELETE":
      return deleteMediaItem(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get media items from Firestore
async function getMediaItems(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { source } = req.query;
    let snapshot;

    if (source && (source === "local" || source === "cloudinary")) {
      // Get media items by source
      snapshot = await adminDb
        .collection(MEDIA_COLLECTION)
        .where("source", "==", source)
        .where("deleted", "==", false)
        .orderBy("createdAt", "desc")
        .get();
    } else {
      // Get all media items
      snapshot = await adminDb
        .collection(MEDIA_COLLECTION)
        .where("deleted", "==", false)
        .orderBy("createdAt", "desc")
        .get();
    }

    const items = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
    }));

    return res.status(200).json({ items });
  } catch (error: any) {
    console.error("Error getting media items from Firestore:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to get media items from Firestore" 
    });
  }
}

// Add media item to Firestore
async function addMediaItem(req: NextApiRequest, res: NextApiResponse) {
  try {
    const item = req.body;

    if (!item) {
      return res.status(400).json({ error: "No item data provided" });
    }

    // Add item to Firestore
    const docRef = await adminDb.collection(MEDIA_COLLECTION).add({
      ...item,
      createdAt: new Date(),
      deleted: false,
    });

    // Return the added item with the Firestore document ID
    return res.status(201).json({
      item: {
        ...item,
        id: docRef.id,
      }
    });
  } catch (error: any) {
    console.error("Error adding media item to Firestore:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to add media item to Firestore" 
    });
  }
}

// Update media item in Firestore
async function updateMediaItem(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updates = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID is required" });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    // Update item in Firestore
    await adminDb.collection(MEDIA_COLLECTION).doc(id).update(updates);

    // Get the updated item
    const docSnapshot = await adminDb.collection(MEDIA_COLLECTION).doc(id).get();
    
    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Item not found after update" });
    }

    const updatedItem = {
      ...docSnapshot.data(),
      id: docSnapshot.id,
      createdAt: docSnapshot.data()?.createdAt.toDate(),
    };

    return res.status(200).json({ item: updatedItem });
  } catch (error: any) {
    console.error("Error updating media item in Firestore:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to update media item in Firestore" 
    });
  }
}

// Delete media item from Firestore (soft delete)
async function deleteMediaItem(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID is required" });
    }

    // Soft delete by setting deleted flag to true
    await adminDb.collection(MEDIA_COLLECTION).doc(id).update({
      deleted: true,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error deleting media item from Firestore:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to delete media item from Firestore" 
    });
  }
}