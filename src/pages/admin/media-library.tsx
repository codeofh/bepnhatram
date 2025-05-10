import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FolderIcon,
  ImageIcon,
  Video,
  X,
  Copy,
  Trash2,
  RefreshCw,
  ExternalLink,
  Filter,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { CloudinaryContext, Image as CloudinaryImage } from "cloudinary-react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { MediaLibraryHelp } from "@/components/Admin/MediaLibraryHelp";
import { MediaLibraryError } from "@/components/Admin/MediaLibraryError";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

// Define types for media items
interface MediaItem {
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
// Sử dụng các biến môi trường hoặc cấu hình cố định
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "bXR9eVM7TG5_KzVprFFApWilbdY";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export default function MediaLibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Declare fetchMediaItems function outside useEffect to make it accessible
  const fetchMediaItems = async () => {
      try {
        setIsLoading(true);
        let allItems: MediaItem[] = [];

        // Fetch local media items from API
        const localResponse = await fetch("/api/media");

        if (localResponse.ok) {
          const localData = await localResponse.json();

          // Transform API response to MediaItem[]
          const localItems: MediaItem[] = localData.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            url: item.url,
            thumbnail: item.thumbnail,
            type: item.type as "image" | "video",
            source: item.source as "local" | "cloudinary",
            size: item.size,
            dimensions: item.dimensions,
            createdAt: new Date(item.createdAt),
            tags: item.tags || [],
          }));

          allItems = [...allItems, ...localItems];
        }

        // Fetch Cloudinary media items
        const cloudinaryResponse = await fetch("/api/media/cloudinary");

        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json();

          // Transform API response to MediaItem[]
          const cloudinaryItems: MediaItem[] = cloudinaryData.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            url: item.url,
            thumbnail: item.thumbnail,
            type: item.type as "image" | "video",
            source: "cloudinary",
            size: item.size,
            dimensions: item.dimensions,
            createdAt: new Date(item.createdAt),
            tags: item.tags || [],
          }));

          allItems = [...allItems, ...cloudinaryItems];
        }

        // If no items are returned from API, use mock data for demonstration
        if (allItems.length === 0) {
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
            {
              id: "local-2",
              name: "intro-video.mp4",
              url: "/uploads/library/intro-video.mp4",
              thumbnail: "/uploads/library/intro-video-thumb.jpg",
              type: "video",
              source: "local",
              size: 3540000,
              createdAt: new Date("2023-09-10"),
              tags: ["intro", "video"],
            },
          ];

          setMediaItems(mockItems);
        } else {
          setMediaItems(allItems);
        }
      } catch (err: any) {
        console.error("Error fetching media items:", err);
        setError(err.message || "Không thể tải thư viện phương tiện");
        toast({
          title: "Lỗi tải dữ liệu",
          description:
            "Không thể tải thư viện phương tiện. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient) {
      fetchMediaItems();
    }
  }, [isClient, toast]);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/admin/media-library");
    }
  }, [user, authLoading, router]);

  // File dropzone configuration
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);

      try {
        // Process each file
        for (const file of acceptedFiles) {
          // Determine if it's an image or video
          const fileType = file.type.startsWith("image/") ? "image" : "video";

          // Create a thumbnail and process the file
          // This is a simplified version
          const reader = new FileReader();

          reader.onloadend = async () => {
            try {
              // Create a FormData object to send the file to the server
              const formData = new FormData();
              formData.append("file", file);

              // Send the file to the server
              const response = await fetch("/api/media", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
              }

              const data = await response.json();

              // Create a new media item from the API response
              const newItem: MediaItem = {
                id: data.item.id,
                name: data.item.name,
                url: data.item.url,
                thumbnail: data.item.thumbnail,
                type: data.item.type as "image" | "video",
                source: "local",
                size: data.item.size,
                createdAt: new Date(data.item.createdAt),
                tags: [],
              };

              setMediaItems((prev) => [newItem, ...prev]);

              toast({
                title: "Tải lên thành công",
                description: `Đã tải lên ${file.name} thành công`,
              });
            } catch (error) {
              console.error("Error uploading file:", error);
              toast({
                title: "Lỗi tải lên",
                description: `Không thể tải lên ${file.name}. Vui lòng thử lại.`,
                variant: "destructive",
              });
            }
          };

          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Error handling file upload:", error);
        toast({
          title: "Lỗi tải lên",
          description: "Đã xảy ra lỗi khi xử lý tệp. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [toast],
  );

const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
  });

  // Function to refresh media items and clear errors
  const refreshMediaLibrary = () => {
    setError(null);
    fetchMediaItems();
  };

  // Function to upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    try {
      setIsUploading(true);

      // Bước 1: Tải lên Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      cloudinaryFormData.append("api_key", CLOUDINARY_API_KEY);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        },
      );

      if (!cloudinaryResponse.ok) {
        throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.statusText}`);
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log("Cloudinary response:", cloudinaryData);

      // Bước 2: Lưu thông tin vào API của chúng ta
      const apiFormData = new FormData();
      apiFormData.append("name", file.name || cloudinaryData.original_filename || cloudinaryData.public_id);
      apiFormData.append("url", cloudinaryData.secure_url);
      apiFormData.append("thumbnail",
        cloudinaryData.resource_type === "image"
          ? cloudinaryData.secure_url
          : cloudinaryData.thumbnail_url || "/placeholder-video-thumb.jpg"
      );
      apiFormData.append("type", cloudinaryData.resource_type === "image" ? "image" : "video");
      apiFormData.append("source", "cloudinary");
      apiFormData.append("size", (cloudinaryData.bytes || 0).toString());
      apiFormData.append("width", (cloudinaryData.width || 0).toString());
      apiFormData.append("height", (cloudinaryData.height || 0).toString());
      apiFormData.append("cloudinaryPublicId", cloudinaryData.public_id);

      try {
        const apiResponse = await fetch("/api/media/cloudinary", {
          method: "POST",
          body: apiFormData,
        });

        if (!apiResponse.ok) {
          console.error(`API storage failed: ${apiResponse.statusText}`);
          // Nếu API lưu trữ thất bại, vẫn hiển thị hình ảnh đã tải lên Cloudinary
          const fallbackItem: MediaItem = {
            id: `cloudinary-temp-${Date.now()}`,
            name: file.name || cloudinaryData.original_filename || cloudinaryData.public_id,
            url: cloudinaryData.secure_url,
            thumbnail: cloudinaryData.resource_type === "image"
              ? cloudinaryData.secure_url
              : cloudinaryData.thumbnail_url || "/placeholder-video-thumb.jpg",
            type: cloudinaryData.resource_type === "image" ? "image" : "video",
            source: "cloudinary",
            size: cloudinaryData.bytes || 0,
            dimensions: {
              width: cloudinaryData.width || 0,
              height: cloudinaryData.height || 0,
            },
            createdAt: new Date(),
            tags: [],
          };

          setMediaItems((prev) => [fallbackItem, ...prev]);

          toast({
            title: "Tải lên Cloudinary thành công",
            description: "Đã tải lên Cloudinary nhưng không thể lưu vào cơ sở dữ liệu. Bạn vẫn có thể sử dụng tệp này.",
          });

          return;
        }

        const apiData = await apiResponse.json();

        // Tạo item mới từ dữ liệu API trả về
        const newItem: MediaItem = {
          id: apiData.item.id,
          name: apiData.item.name,
          url: apiData.item.url,
          thumbnail: apiData.item.thumbnail,
          type: apiData.item.type as "image" | "video",
          source: "cloudinary",
          size: apiData.item.size,
          dimensions: {
            width: apiData.item.dimensions?.width || 0,
            height: apiData.item.dimensions?.height || 0,
          },
          createdAt: new Date(apiData.item.createdAt),
          tags: apiData.item.tags || [],
        };

        setMediaItems((prev) => [newItem, ...prev]);

        toast({
          title: "Tải lên thành công",
          description: `Đã tải lên ${file.name} lên Cloudinary thành công`,
        });
      } catch (error) {
        console.error("Error saving to database:", error);
        // Nếu có lỗi khi lưu vào cơ sở dữ liệu, vẫn hiển thị hình ảnh đã tải lên Cloudinary
        const fallbackItem: MediaItem = {
          id: `cloudinary-temp-${Date.now()}`,
          name: file.name || cloudinaryData.original_filename || cloudinaryData.public_id,
          url: cloudinaryData.secure_url,
          thumbnail: cloudinaryData.resource_type === "image"
            ? cloudinaryData.secure_url
            : cloudinaryData.thumbnail_url || "/placeholder-video-thumb.jpg",
          type: cloudinaryData.resource_type === "image" ? "image" : "video",
          source: "cloudinary",
          size: cloudinaryData.bytes || 0,
          dimensions: {
            width: cloudinaryData.width || 0,
            height: cloudinaryData.height || 0,
          },
          createdAt: new Date(),
          tags: [],
        };

        setMediaItems((prev) => [fallbackItem, ...prev]);

        toast({
          title: "Tải lên Cloudinary thành công",
          description: "Đã tải lên Cloudinary nhưng không thể lưu vào cơ sở dữ liệu. Bạn vẫn có thể sử dụng tệp này.",
        });
      }

      setMediaItems((prev) => [newItem, ...prev]);

      toast({
        title: "Tải lên thành công",
        description: `Đã tải lên ${file.name} lên Cloudinary thành công`,
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      toast({
        title: "Lỗi tải lên Cloudinary",
        description:
          "Không thể tải lên Cloudinary. Vui lòng kiểm tra kết nối mạng và thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Cloudinary upload
  const handleCloudinaryUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadToCloudinary(files[0]);
    }
  };

  // Filter media items based on search and active tab
  const filteredMediaItems = mediaItems
    .filter((item) => {
      // Filter by search query
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      ) {
        return false;
      }

      // Filter by tab
      if (activeTab === "local" && item.source !== "local") return false;
      if (activeTab === "cloudinary" && item.source !== "cloudinary")
        return false;
      if (activeTab === "images" && item.type !== "image") return false;
      if (activeTab === "videos" && item.type !== "video") return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Đã sao chép",
      description: "Đã sao chép URL vào clipboard",
    });
  };

  // Handle item selection (for bulk actions)
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  // Delete item
  const handleDeleteItem = async (item: MediaItem) => {
    try {
      // Xử lý xóa tệp dựa trên nguồn
      if (item.source === "local") {
        // Extract filename from URL
        const filename = item.url.split("/").pop();

        // Delete file from server
        const response = await fetch(`/api/media?filename=${filename}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.statusText}`);
        }
      } else if (item.source === "cloudinary") {
        // Xóa thông tin tệp Cloudinary từ cơ sở dữ liệu của chúng ta
        const response = await fetch(`/api/media/cloudinary?id=${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.statusText}`);
        }

        // Lưu ý: Chúng ta không xóa tệp thực tế từ Cloudinary ở đây
        // Để xóa tệp từ Cloudinary, bạn cần sử dụng Cloudinary API với khóa API bí mật
        // Điều này thường được thực hiện ở phía server
      }

      setMediaItems((prev) =>
        prev.filter((mediaItem) => mediaItem.id !== item.id),
      );

      if (selectedItems.includes(item.id)) {
        setSelectedItems((prev) => prev.filter((id) => id !== item.id));
      }

      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }

      toast({
        title: "Đã xóa",
        description: `Đã xóa ${item.name} thành công`,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa phương tiện. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      // Get all selected items
      const itemsToDelete = mediaItems.filter(item => selectedItems.includes(item.id));

      // Delete each item
      for (const item of itemsToDelete) {
        if (item.source === "local") {
          // Extract filename from URL
          const filename = item.url.split("/").pop();

          // Delete file from server
          const response = await fetch(`/api/media?filename=${filename}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
          }
        } else if (item.source === "cloudinary") {
          // Xóa thông tin tệp Cloudinary từ cơ sở dữ liệu của chúng ta
          const response = await fetch(`/api/media/cloudinary?id=${item.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
          }
        }
      }

      setMediaItems((prev) =>
        prev.filter((item) => !selectedItems.includes(item.id)),
      );

      toast({
        title: "Đã xóa",
        description: `Đã xóa ${selectedItems.length} mục thành công`,
      });

      setSelectedItems([]);
    } catch (error) {
      console.error("Error bulk deleting items:", error);
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa các mục đã chọn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Update item tags
  const updateItemTags = (item: MediaItem, tags: string[]) => {
    setMediaItems((prev) =>
      prev.map((mediaItem) =>
        mediaItem.id === item.id ? { ...mediaItem, tags } : mediaItem,
      ),
    );

    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...selectedItem, tags });
    }

    // In a real app, you would send this update to the server
    // For now, we'll just update the local state
    toast({
      title: "Đã cập nhật",
      description: "Thẻ đã được cập nhật thành công",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number = 0): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || !isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Thư viện phương tiện - Admin</title>
        <meta name="description" content="Quản lý thư viện phương tiện" />
      </Head>

      <AdminLayout title="Thư viện phương tiện">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
                <AlertDescription>
                  {error}. Vui lòng thử làm mới trang.
                </AlertDescription>
              </Alert>
            )}
          {/* Top bar with search and actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-auto max-w-sm">
              <Input
                type="text"
                placeholder="Tìm kiếm tên tệp, thẻ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedItems.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa ({selectedItems.length})</span>
                </Button>
              )}

              <div className="flex-1"></div>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="name">Tên tệp</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <input
                  type="file"
                  id="cloudinary-upload"
                  className="hidden"
                  onChange={handleCloudinaryUpload}
                  accept="image/*,video/*"
                />
                <Button variant="outline" asChild>
                  <label
                    htmlFor="cloudinary-upload"
                    className="cursor-pointer flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Cloudinary</span>
                  </label>
                </Button>
              </div>

              <Button {...getRootProps()} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4 mr-2" />
                    <span>{isDragActive ? "Thả để tải lên" : "Tải lên"}</span>
                    <input {...getInputProps()} />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs for filtering */}
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="images">Hình ảnh</TabsTrigger>
              <TabsTrigger value="videos">Video</TabsTrigger>
              <TabsTrigger value="local">Tệp cục bộ</TabsTrigger>
              <TabsTrigger value="cloudinary">Cloudinary</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMediaItems.length === 0 ? (
            <Card className="border-dashed bg-gray-50">
              <CardContent className="py-10 text-center">
                <FolderIcon className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                <CardTitle className="text-lg mb-2">
                  Không có phương tiện
                </CardTitle>
                <CardDescription>
                  {searchQuery
                    ? "Không tìm thấy kết quả phù hợp với tìm kiếm của bạn."
                    : "Bắt đầu bằng cách tải lên một hình ảnh hoặc video."}
                </CardDescription>
                {searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchQuery("")}
                  >
                    Xóa tìm kiếm
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMediaItems.map((item) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md group ${
                    selectedItems.includes(item.id)
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                  onClick={() => {
                    if (!selectedItems.length) {
                      setSelectedItem(item);
                      setDetailsOpen(true);
                    } else {
                      toggleItemSelection(item.id);
                    }
                  }}
                >
                  <div className="relative h-32 bg-gray-100">
                    {item.type === "image" ? (
                      <Image
                        src={item.thumbnail || item.url}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Selection checkbox */}
                    <div
                      className={`absolute top-2 left-2 h-5 w-5 rounded border border-gray-300 flex items-center justify-center ${
                        selectedItems.includes(item.id)
                          ? "bg-primary"
                          : "bg-white"
                      } ${selectedItems.length > 0 || selectedItems.includes(item.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(item.id);
                      }}
                    >
                      {selectedItems.includes(item.id) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Source badge */}
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2 text-xs"
                    >
                      {item.source === "local" ? "Local" : "Cloudinary"}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <div
                      className="text-sm font-medium line-clamp-1"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatFileSize(item.size)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
          <div className="w-full sm:w-1/3 lg:w-1/4 space-y-6">
            {error ? (
              <MediaLibraryError onRefresh={refreshMediaLibrary} />
            ) : (
              <MediaLibraryHelp />
            )}
          </div>
        </div>
      </AdminLayout>

      {/* Media details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phương tiện</DialogTitle>
            <DialogDescription>
              Xem và quản lý thông tin chi tiết của phương tiện
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-md flex items-center justify-center p-4 min-h-[200px]">
                {selectedItem.type === "image" ? (
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={selectedItem.url}
                      alt={selectedItem.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm font-medium">
                      {selectedItem.name}
                    </div>
                    <Button
                      variant="link"
                      className="mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(selectedItem.url, "_blank");
                      }}
                    >
                      Xem video
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Tên tệp</Label>
                  <div className="font-medium">{selectedItem.name}</div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">URL</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={selectedItem.url} readOnly className="pr-9" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 absolute right-1"
                      onClick={() => copyToClipboard(selectedItem.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Loại</Label>
                    <div className="font-medium">
                      {selectedItem.type === "image" ? "Hình ảnh" : "Video"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Nguồn</Label>
                    <div className="font-medium">
                      {selectedItem.source === "local"
                        ? "Tệp cục bộ"
                        : "Cloudinary"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Kích thước</Label>
                    <div className="font-medium">
                      {formatFileSize(selectedItem.size)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Ngày tạo</Label>
                    <div className="font-medium">
                      {formatDate(selectedItem.createdAt)}
                    </div>
                  </div>
                  {selectedItem.dimensions && (
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500">
                        Kích thước
                      </Label>
                      <div className="font-medium">
                        {selectedItem.dimensions.width} ×{" "}
                        {selectedItem.dimensions.height} px
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">
                    Thẻ
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags && selectedItem.tags.length > 0 ? (
                      selectedItem.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => {
                              const newTags =
                                selectedItem.tags?.filter(
                                  (t, i) => i !== index,
                                ) || [];
                              updateItemTags(selectedItem, newTags);
                            }}
                          />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        Chưa có thẻ nào
                      </span>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem(
                          "tag",
                        ) as HTMLInputElement;
                        if (input.value.trim()) {
                          const newTags = [
                            ...(selectedItem.tags || []),
                            input.value.trim(),
                          ];
                          updateItemTags(selectedItem, newTags);
                          input.value = "";
                        }
                      }}
                      className="flex-1 min-w-[150px]"
                    >
                      <Input
                        name="tag"
                        placeholder="Thêm thẻ..."
                        className="h-8 text-sm"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setItemToDelete(selectedItem);
                setDetailsOpen(false);
                setConfirmDeleteOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Đóng
              </Button>
              <Button
                onClick={() => {
                  if (selectedItem) {
                    copyToClipboard(selectedItem.url);
                  }
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Sao chép URL
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {itemToDelete?.name}? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && handleDeleteItem(itemToDelete)}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}