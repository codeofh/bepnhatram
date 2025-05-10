import { NextApiRequest, NextApiResponse } from "next";
import { deleteLocalFile } from "@/lib/mediaLibraryServer";
import path from "path";
import fs from "fs";

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

  // Only handle local media items in this endpoint
  if (!id.startsWith("local-")) {
    return res
      .status(400)
      .json({ error: "This endpoint only handles local media" });
  }

  // Extract the filename from the ID
  const fileName = id.replace("local-", "");
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Media not found" });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return getMediaItem(req, res, fileName, filePath);
    case "DELETE":
      return deleteMediaItem(req, res, fileName, filePath);
    case "PATCH":
      return updateMediaItem(req, res, fileName, filePath);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get single media item
async function getMediaItem(
  req: NextApiRequest,
  res: NextApiResponse,
  fileName: string,
  filePath: string,
) {
  try {
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(fileName).toLowerCase();

    // Determine file type based on extension
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".wmv"];

    let fileType = "other";
    if (imageExtensions.includes(fileExtension)) {
      fileType = "image";
    } else if (videoExtensions.includes(fileExtension)) {
      fileType = "video";
    }

    const mediaItem = {
      id: `local-${fileName}`,
      name: fileName,
      url: `/uploads/library/${fileName}`,
      thumbnail: fileType === "image" ? `/uploads/library/${fileName}` : null,
      type: fileType,
      source: "local",
      size: stats.size,
      createdAt: stats.birthtime,
    };

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
  fileName: string,
  filePath: string,
) {
  try {
    // Delete the file
    fs.unlinkSync(filePath);

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
  fileName: string,
  filePath: string,
) {
  try {
    const { name, tags } = req.body;

    // Currently, we only support updating metadata, not the actual file
    // In a real app, you might store this metadata in a database

    // For now, just return success as if we updated it
    return res.status(200).json({
      success: true,
      item: {
        id: `local-${fileName}`,
        name: name || fileName,
        url: `/uploads/library/${fileName}`,
        tags: tags || [],
      },
    });
  } catch (error: any) {
    console.error("Error updating media item:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to update media item" });
  }
}
