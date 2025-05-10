import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
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
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo",
  apiKey:
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "bXR9eVM7TG5_KzVprFFApWilbdY",
  uploadPreset:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default",
};

// Upload path constants - these are safe to use on client side as they're just strings
export const UPLOAD_DIRECTORY = "/uploads/library";

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

      // Fetch media items from API
      const response = await fetch("/api/media");
      if (!response.ok) {
        throw new Error("Failed to fetch media items");
      }

      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        // Transform dates from string to Date objects
        const items = data.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));

        setMediaItems(items);
      } else {
        // If API returns no items, use empty array
        setMediaItems([]);
      }
    } catch (err: any) {
      console.error("Error loading media items:", err);
      setError(err.message || "Failed to load media");
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file to local API endpoint
  const uploadFile = async (
    file: File,
    destination: "local" | "cloudinary" = "local",
  ) => {
    try {
      let newItem: MediaItem | null = null;

      if (destination === "local") {
        // Create FormData and append file
        const formData = new FormData();
        formData.append("file", file);

        // Send to server API
        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload to server failed");
        }

        const data = await response.json();
        newItem = {
          ...data.item,
          createdAt: new Date(data.item.createdAt),
        };
      } else {
        // Upload to Cloudinary
        newItem = await uploadToCloudinary(file);

        if (newItem) {
          // Save Cloudinary info to our API
          const formData = new FormData();
          formData.append("name", newItem.name);
          formData.append("url", newItem.url);
          formData.append("thumbnail", newItem.thumbnail || newItem.url);
          formData.append("type", newItem.type);
          formData.append("source", "cloudinary");
          formData.append("size", newItem.size?.toString() || "0");
          formData.append(
            "width",
            newItem.dimensions?.width?.toString() || "0",
          );
          formData.append(
            "height",
            newItem.dimensions?.height?.toString() || "0",
          );
          formData.append(
            "cloudinaryPublicId",
            newItem.id.replace("cloudinary-", ""),
          );

          const apiResponse = await fetch("/api/media/cloudinary", {
            method: "POST",
            body: formData,
          });

          if (!apiResponse.ok) {
            console.warn(
              "Failed to save Cloudinary info to API, but upload succeeded",
            );
          } else {
            const apiData = await apiResponse.json();
            newItem = {
              ...apiData.item,
              createdAt: new Date(apiData.item.createdAt),
            };
          }
        }
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
        // Extract filename from URL
        const filename = item.url.split("/").pop();

        // Call API to delete the file
        const response = await fetch(`/api/media?filename=${filename}`, {
          method: "DELETE",
        });

        success = response.ok;
      } else {
        // Delete Cloudinary reference from our DB
        const response = await fetch(`/api/media/cloudinary?id=${item.id}`, {
          method: "DELETE",
        });

        success = response.ok;
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
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "wmv"];

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
