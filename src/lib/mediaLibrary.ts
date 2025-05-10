import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { toast } from "sonner";

// Define types for media items
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type: "image" | "video";
  source: "local" | "cloudinary";
  size?: number;
  dimensions?: { width: number; height: number };
  createdAt: Date;
  tags?: string[];
}

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: "YOUR_CLOUD_NAME", // Replace with your cloud name
  apiKey: "bXR9eVM7TG5_KzVprFFApWilbdY",
  uploadPreset: "ml_default", // Replace with your upload preset
};

// Local storage paths
export const UPLOAD_DIRECTORY = "/uploads/library";
export const UPLOAD_PATH = path.join(process.cwd(), "public", UPLOAD_DIRECTORY);

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

// Function to upload file to local storage
export const uploadFileToLocal = async (
  file: File,
): Promise<MediaItem | null> => {
  try {
    ensureUploadDirectory();

    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_PATH, fileName);

    // In a real server-side function, we would use fs.writeFile
    // For client-side, you would use FormData and fetch to an API
    // This is a simplified version that would need to be implemented server-side

    // Create a MediaItem object
    const isImage = file.type.startsWith("image/");

    const newItem: MediaItem = {
      id: `local-${uuidv4()}`,
      name: file.name,
      url: `${UPLOAD_DIRECTORY}/${fileName}`,
      thumbnail: isImage ? `${UPLOAD_DIRECTORY}/${fileName}` : undefined,
      type: isImage ? "image" : "video",
      source: "local",
      size: file.size,
      createdAt: new Date(),
      tags: [],
    };

    return newItem;
  } catch (error) {
    console.error("Error uploading file to local storage:", error);
    return null;
  }
};

// Function to upload file to Cloudinary
export const uploadToCloudinary = async (
  file: File,
): Promise<MediaItem | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("api_key", CLOUDINARY_CONFIG.apiKey);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Create a MediaItem from Cloudinary response
    const newItem: MediaItem = {
      id: `cloudinary-${data.public_id}`,
      name: file.name,
      url: data.secure_url,
      thumbnail:
        data.resource_type === "image" ? data.secure_url : data.thumbnail_url,
      type: data.resource_type === "image" ? "image" : "video",
      source: "cloudinary",
      size: data.bytes,
      dimensions: {
        width: data.width,
        height: data.height,
      },
      createdAt: new Date(),
      tags: [],
    };

    return newItem;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

// Function to delete file from local storage
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

// Function to delete file from Cloudinary
export const deleteCloudinaryFile = async (
  publicId: string,
): Promise<boolean> => {
  try {
    // In a real app, this would be a server-side API call using the Cloudinary SDK
    // For client-side, you would typically call a serverless function or API endpoint

    // This is a placeholder for the actual implementation
    console.log("Would delete from Cloudinary:", publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

// Custom hook for managing media items
export function useMediaLibrary() {
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load media items
  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch local files and Cloudinary files
      // This would be an API call in a real application
      // For now, we'll use placeholder data

      const mockItems: MediaItem[] = [
        {
          id: "local-1",
          name: "banner.jpg",
          url: "/uploads/library/banner.jpg",
          thumbnail: "/uploads/library/banner.jpg",
          type: "image",
          source: "local",
          size: 254000,
          dimensions: { width: 1920, height: 1080 },
          createdAt: new Date("2023-08-15"),
          tags: ["banner", "homepage"],
        },
        {
          id: "cloudinary-1",
          name: "product-photo.jpg",
          url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
          thumbnail:
            "https://res.cloudinary.com/demo/image/upload/c_thumb,w_200,g_face/v1312461204/sample.jpg",
          type: "image",
          source: "cloudinary",
          size: 124000,
          dimensions: { width: 1200, height: 800 },
          createdAt: new Date("2023-09-05"),
          tags: ["product", "food"],
        },
      ];

      setMediaItems(mockItems);
    } catch (err: any) {
      console.error("Error loading media items:", err);
      setError(err.message || "Failed to load media");
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file (to either local or Cloudinary)
  const uploadFile = async (
    file: File,
    destination: "local" | "cloudinary" = "local",
  ) => {
    try {
      let newItem: MediaItem | null = null;

      if (destination === "local") {
        newItem = await uploadFileToLocal(file);
      } else {
        newItem = await uploadToCloudinary(file);
      }

      if (newItem) {
        setMediaItems((prev) => [newItem!, ...prev]);
        toast.success(`${file.name} đã được tải lên thành công`);
        return newItem;
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: any) {
      console.error("Error uploading file:", err);
      toast.error(
        `Không thể tải lên ${file.name}: ${err.message || "Lỗi không xác định"}`,
      );
      return null;
    }
  };

  // Delete media item
  const deleteItem = async (item: MediaItem) => {
    try {
      let success = false;

      if (item.source === "local") {
        success = await deleteLocalFile(item.url);
      } else {
        // Extract public ID from Cloudinary URL or ID
        const publicId = item.id.replace("cloudinary-", "");
        success = await deleteCloudinaryFile(publicId);
      }

      if (success) {
        setMediaItems((prev) =>
          prev.filter((mediaItem) => mediaItem.id !== item.id),
        );
        toast.success(`${item.name} đã được xóa`);
        return true;
      } else {
        throw new Error("Delete failed");
      }
    } catch (err: any) {
      console.error("Error deleting item:", err);
      toast.error(
        `Không thể xóa ${item.name}: ${err.message || "Lỗi không xác định"}`,
      );
      return false;
    }
  };

  // Update media item
  const updateItem = async (id: string, updates: Partial<MediaItem>) => {
    try {
      setMediaItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
      toast.success("Đã cập nhật thành công");
      return true;
    } catch (err: any) {
      console.error("Error updating item:", err);
      toast.error(`Không thể cập nhật: ${err.message || "Lỗi không xác định"}`);
      return false;
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadMediaItems();
  }, []);

  return {
    isLoading,
    mediaItems,
    error,
    uploadFile,
    deleteItem,
    updateItem,
    refreshItems: loadMediaItems,
  };
}

// Helper functions
export const getFileType = (filename: string): "image" | "video" | "other" => {
  const ext = path.extname(filename).toLowerCase();

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

  if (imageExtensions.includes(ext)) {
    return "image";
  } else if (videoExtensions.includes(ext)) {
    return "video";
  } else {
    return "other";
  }
};

export const formatFileSize = (bytes: number = 0): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
