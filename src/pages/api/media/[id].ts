import { NextApiRequest, NextApiResponse } from "next";
import { deleteLocalFile } from "@/lib/mediaLibraryServer";
import path from "path";
import fs from "fs";
import { serverGetMediaItemsBySource, serverUpdateMediaItem } from "@/lib/mediaFirestore";

// Constants
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "library");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Get media ID from the request
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid media ID" });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return getMediaItem(req, res, id);
    case "DELETE":
      return deleteMediaItem(req, res, id);
    case "PATCH":
      return updateMediaItem(req, res, id);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get single media item
async function getMediaItem(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  try {
    // Lấy tất cả media items từ Firestore
    const allItems = await serverGetMediaItemsBySource("local");
    
    // Tìm item theo ID
    const mediaItem = allItems.find(item => item.id === id);
    
    if (!mediaItem) {
      return res.status(404).json({ error: "Media not found" });
    }
    
    // Kiểm tra xem file có tồn tại không (nếu là local media)
    if (mediaItem.source === "local") {
      const filePath = path.join(process.cwd(), "public", mediaItem.url);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Media file not found" });
      }
    }

    return res.status(200).json({ item: mediaItem });
  } catch (error: any) {
    console.error("Error getting media item:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get media item" });
  }
}

// Delete media item
async function deleteMediaItem(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  try {
    // Lấy tất cả media items từ Firestore
    const allItems = await serverGetMediaItemsBySource("local");
    
    // Tìm item theo ID
    const mediaItem = allItems.find(item => item.id === id);
    
    if (!mediaItem) {
      return res.status(404).json({ error: "Media not found" });
    }
    
    // Nếu là local media, xóa file
    if (mediaItem.source === "local") {
      const filePath = path.join(process.cwd(), "public", mediaItem.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Xóa thông tin từ Firestore
    await serverUpdateMediaItem(id, { deleted: true });

    return res
      .status(200)
      .json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting media item:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete media item" });
  }
}

// Update media item (rename, add tags, etc.)
async function updateMediaItem(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  try {
    const updates = req.body;
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }
    
    // Cập nhật thông tin trong Firestore
    await serverUpdateMediaItem(id, updates);
    
    // Lấy thông tin đã cập nhật
    const allItems = await serverGetMediaItemsBySource("local");
    const updatedItem = allItems.find(item => item.id === id);
    
    if (!updatedItem) {
      return res.status(404).json({ error: "Media not found after update" });
    }

    return res.status(200).json({
      success: true,
      item: updatedItem,
    });
  } catch (error: any) {
    console.error("Error updating media item:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to update media item" });
  }
}
