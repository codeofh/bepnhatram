import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getFileType } from "./mediaLibrary";

// Set upload directory
export const UPLOAD_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "library",
);

// Function to ensure upload directory exists
export const ensureUploadDirectory = () => {
  try {
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error("Error creating upload directory:", error);
    return false;
  }
};

// Function to upload file to local storage (SERVER SIDE ONLY)
export const uploadFileToLocal = async (file: {
  filepath: string;
  originalFilename?: string;
  size: number;
}): Promise<{
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type: "image" | "video" | "other";
  source: "local";
  size: number;
  createdAt: Date;
  tags?: string[];
} | null> => {
  try {
    ensureUploadDirectory();

    const fileExtension = path.extname(file.originalFilename || "");
    const fileName = `${uuidv4()}${fileExtension}`;
    const newPath = path.join(UPLOAD_PATH, fileName);

    // Rename/move the uploaded file
    if (file.filepath !== newPath) {
      fs.copyFileSync(file.filepath, newPath);
      fs.unlinkSync(file.filepath); // Remove the temp file
    }

    // Get file type
    const fileType = getFileType(file.originalFilename || "");

    if (fileType === "other") {
      return null; // Unsupported file type
    }

    // Create a MediaItem object
    return {
      id: `local-${fileName}`,
      name: file.originalFilename || fileName,
      url: `/uploads/library/${fileName}`,
      thumbnail:
        fileType === "image" ? `/uploads/library/${fileName}` : undefined,
      type: fileType,
      source: "local",
      size: file.size,
      createdAt: new Date(),
      tags: [],
    };
  } catch (error) {
    console.error("Error uploading file to local storage:", error);
    return null;
  }
};

// Function to delete file from local storage (SERVER SIDE ONLY)
export const deleteLocalFile = async (filePath: string): Promise<boolean> => {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn("File does not exist:", fullPath);
      return true;
    }

    // Delete file
    fs.unlinkSync(fullPath);
    return true;
  } catch (error) {
    console.error("Error deleting local file:", error);
    return false;
  }
};

// Get media items from local storage (SERVER SIDE ONLY)
export const getLocalMediaItems = async () => {
  try {
    ensureUploadDirectory();

    // Read all files in the directory
    const files = fs.readdirSync(UPLOAD_PATH);

    return files
      .map((file) => {
        const filePath = path.join(UPLOAD_PATH, file);
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
          tags: [],
        };
      })
      .filter(Boolean); // Remove nulls
  } catch (error) {
    console.error("Error getting local media items:", error);
    return [];
  }
};
