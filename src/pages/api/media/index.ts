import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getFileType } from "@/lib/mediaLibrary";

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Set upload directory
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "library");

// Ensure upload directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return getMediaItems(req, res);
    case "POST":
      return uploadMedia(req, res);
    case "DELETE":
      return deleteMedia(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get all media items
async function getMediaItems(req: NextApiRequest, res: NextApiResponse) {
  try {
    ensureUploadDir();

    // Read all files in the directory
    const files = fs.readdirSync(UPLOAD_DIR);

    const mediaItems = files
      .map((file) => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        const type = getFileType(file);

        if (type === "other") {
          return null; // Skip non-image/video files
        }

        const relativePath = `/uploads/library/${file}`;

        return {
          id: `local-${file}`,
          name: file,
          url: relativePath,
          thumbnail: type === "image" ? relativePath : null,
          type,
          source: "local",
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .filter(Boolean); // Remove nulls

    return res.status(200).json({ items: mediaItems });
  } catch (error: any) {
    console.error("Error getting media items:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get media items" });
  }
}

// Upload media file
async function uploadMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    ensureUploadDir();

    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          res.status(500).json({ error: "Failed to upload file" });
          return resolve(null);
        }

        const file = files.file?.[0];

        if (!file) {
          res.status(400).json({ error: "No file uploaded" });
          return resolve(null);
        }

        // Get file type
        const fileType = getFileType(file.originalFilename || "");

        if (fileType === "other") {
          res.status(400).json({ error: "Unsupported file type" });
          return resolve(null);
        }

        // Generate a unique filename
        const fileName = `${uuidv4()}${path.extname(file.originalFilename || "")}`;
        const newPath = path.join(UPLOAD_DIR, fileName);

        // Rename the file (if it has a temporary name)
        if (file.filepath !== newPath) {
          fs.renameSync(file.filepath, newPath);
        }

        // Create response data
        const mediaItem = {
          id: `local-${fileName}`,
          name: file.originalFilename || fileName,
          url: `/uploads/library/${fileName}`,
          thumbnail:
            fileType === "image" ? `/uploads/library/${fileName}` : null,
          type: fileType,
          source: "local",
          size: file.size,
          createdAt: new Date(),
        };

        res.status(201).json({ item: mediaItem });
        return resolve(null);
      });
    });
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to upload media" });
  }
}

// Delete media file
async function deleteMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filename } = req.query;
    
    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ error: "Filename is required" });
    }
    
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete media" });
  }
}
