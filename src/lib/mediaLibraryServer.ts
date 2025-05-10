import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getFileType } from "./mediaLibrary";
import { MediaItem } from "./mediaLibrary";
import { serverAddMediaItem, serverGetMediaItemsBySource, serverDeleteMediaItem } from "./mediaFirestore";

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
  originalFilename?: string | null;
  size: number;
}): Promise<MediaItem | null> => {
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
    const mediaItem: MediaItem = {
      id: `local-${fileName}`, // Tạm thời tạo ID, sẽ được thay thế bởi Firestore document ID
      name: file.originalFilename || fileName,
      url: `/uploads/library/${fileName}`,
      thumbnail:
        fileType === "image" ? `/uploads/library/${fileName}` : undefined,
      type: fileType,
      source: "local",
      size: file.size,
      createdAt: new Date(),
      tags: [],
      uploadSource: "admin-panel", // Thêm thông tin nguồn upload
      path: `/uploads/library/${fileName}`, // Thêm đường dẫn đầy đủ
    };

    // Trả về item gốc
    return mediaItem;
  } catch (error) {
    console.error("Error uploading file to local storage:", error);
    return null;
  }
};

// Function to delete file from local storage (SERVER SIDE ONLY)
export const deleteLocalFile = async (filePath: string, mediaId?: string): Promise<boolean> => {
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
    // Quét thư mục local
    ensureUploadDirectory();
    const files = fs.readdirSync(UPLOAD_PATH);
    
    const items = files
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
          path: relativePath,
          uploadSource: "file-system-scan",
        };
      })
      .filter(Boolean) as MediaItem[]; // Remove nulls
    
    // Kiểm tra xem file có tồn tại không
    const validItems = items.filter(item => {
      const fullPath = path.join(process.cwd(), "public", item.url);
      return fs.existsSync(fullPath);
    });
    
    return validItems;
  } catch (error) {
    console.error("Error getting local media items:", error);
    return [];
  }
};

// Scan local directory and sync with Firestore
export const syncLocalMediaWithFirestore = async () => {
  try {
    ensureUploadDirectory();

    // Read all files in the directory
    const files = fs.readdirSync(UPLOAD_PATH);
    
    // Quét thư mục local
    const items = files
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
          path: relativePath,
          uploadSource: "file-system-scan",
        };
      })
      .filter(Boolean) as MediaItem[]; // Remove nulls
    
    return true;
  } catch (error) {
    console.error("Error syncing local media with Firestore:", error);
    return false;
  }
};
