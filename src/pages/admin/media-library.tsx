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
import { collection, addDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } from "firebase/firestore";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { MediaLibraryHelp } from "@/components/Admin/MediaLibraryHelp";
import { MediaLibraryError } from "@/components/Admin/MediaLibraryError";
import { MediaItemCard } from "@/components/Admin/MediaItemCard";
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
import { db } from "@/lib/firebase";

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
  cloudinaryPublicId?: string;
}

// Cloudinary configuration
// Sử dụng các biến môi trường hoặc cấu hình cố định
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_API_KEY =
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "bXR9eVM7TG5_KzVprFFApWilbdY";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

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

  // Hàm lấy dữ liệu media từ Firebase
  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      
      // Lấy dữ liệu từ Firebase
      if (!db) {
        console.warn('Firebase không được khởi tạo');
        throw new Error('Firebase không được khởi tạo');
      }
      
      // Lấy dữ liệu từ collection 'media'
      const mediaCollection = collection(db, 'media');
      
      // Tạo query để sắp xếp theo thời gian tạo giảm dần (mới nhất trước)
      const mediaQuery = query(mediaCollection, orderBy('createdAt', 'desc'));
      
      // Lấy tất cả documents
      const querySnapshot = await getDocs(mediaQuery);
      
      // Chuyển đổi dữ liệu từ Firestore thành đối tượng MediaItem
      const items: MediaItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Chuyển đổi timestamp thành Date object nếu cần
        const createdAt = data.createdAt instanceof Date 
          ? data.createdAt 
          : new Date(data.createdAt?.seconds * 1000 || Date.now());
        
        items.push({
          id: doc.id,
          name: data.name || '',
          url: data.url || '',
          thumbnail: data.thumbnail || '',
          type: data.type as "image" | "video",
          source: data.source as "local" | "cloudinary",
          size: data.size,
          dimensions: data.dimensions,
          createdAt: createdAt,
          tags: data.tags || [],
          cloudinaryPublicId: data.cloudinaryPublicId
        });
      });

      // Luôn hiển thị dữ liệu từ Firebase, dù có hay không
      setMediaItems(items);
      
      // Ghi log nếu không có dữ liệu
      if (items.length === 0) {
        console.log("Không có dữ liệu từ Firebase, hiển thị danh sách trống");
      }
    } catch (err: any) {
      console.error("Error fetching media items:", err);
      setError(err.message || "Không thể tải thư viện phương tiện");
      toast({
        title: "Lỗi tải dữ liệu",
        description:
          "Không thể tải thư viện phương tiện từ Firebase. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Không cần hàm này nữa vì đã tích hợp vào fetchMediaItems

  // Fetch media items on initial load
  useEffect(() => {
    if (isClient) {
      fetchMediaItems();
    }
  }, [isClient]);

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
              
              // Lưu thông tin vào Firebase
              if (!db) {
                throw new Error("Không thể kết nối đến Firebase");
              }
              
              try {
                // Tạo ID mới cho document Firebase
                const newId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                // Tạo media item từ dữ liệu API response
                const newItem: MediaItem = {
                  id: newId,
                  name: data.item.name,
                  url: data.item.url,
                  thumbnail: data.item.thumbnail,
                  type: data.item.type as "image" | "video",
                  source: "local",
                  size: data.item.size,
                  createdAt: new Date(),
                  tags: [],
                  path: data.item.path || data.item.url,
                };
                
                // Lưu vào Firebase
                console.log('Đang lưu media vào Firebase:', newItem);
                const docRef = doc(db, 'media', newId);
                await setDoc(docRef, {
                  ...newItem,
                  createdAt: new Date().toISOString(),
                });
                
                console.log('Đã lưu media vào Firebase thành công:', newId);
                
                // Cập nhật UI
                setMediaItems((prev) => [newItem, ...prev]);
                
                toast({
                  title: "Tải lên thành công",
                  description: `Đã tải lên ${file.name} thành công`,
                });
              } catch (firebaseError) {
                console.error("Lỗi khi lưu vào Firebase:", firebaseError);
                toast({
                  title: "Lỗi lưu trữ",
                  description: "Đã tải lên tệp nhưng không thể lưu thông tin vào cơ sở dữ liệu.",
                  variant: "destructive",
                });
              }
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
  const refreshMediaLibrary = async () => {
    setError(null);
    try {
      await fetchMediaItems();
      
      toast({
        title: "Làm mới thành công",
        description: "Đã cập nhật thư viện phương tiện từ Firebase",
      });
    } catch (error) {
      console.error("Lỗi khi làm mới thư viện:", error);
      toast({
        title: "Lỗi làm mới",
        description: "Không thể cập nhật thư viện phương tiện. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  // Hàm lưu thông tin media vào Firebase
  const saveMediaToFirebase = async (mediaData: MediaItem) => {
    try {
      if (!db) {
        console.warn('Firebase không được khởi tạo');
        return null;
      }

      // Tạo ID cho document nếu chưa có
      const id = mediaData.id || `cloudinary-${Date.now()}`;
      
      console.log('Đang lưu vào Firebase với ID:', id, 'Dữ liệu:', mediaData);
      
      // Chuẩn bị dữ liệu để lưu - chuyển đổi thành đối tượng thuần túy
      // Loại bỏ các trường không cần thiết và đảm bảo định dạng đúng
      const dataToSave = {
        name: mediaData.name || '',
        url: mediaData.url || '',
        thumbnail: mediaData.thumbnail || '',
        type: mediaData.type || 'image',
        source: mediaData.source || 'cloudinary',
        size: mediaData.size || 0,
        dimensions: mediaData.dimensions || { width: 0, height: 0 },
        createdAt: mediaData.createdAt || new Date(),
        updatedAt: new Date(),
        tags: mediaData.tags || [],
        cloudinaryPublicId: mediaData.cloudinaryPublicId || ''
      };
      
      // Sử dụng setDoc với ID cụ thể để tránh trùng lặp
      const docRef = doc(db, 'media', id);
      await setDoc(docRef, dataToSave);
      
      console.log('Đã lưu vào Firebase thành công:', id);
      return id;
    } catch (error) {
      console.error('Lỗi khi lưu vào Firebase:', error);
      return null;
    }
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
        throw new Error(
          `Cloudinary upload failed: ${cloudinaryResponse.statusText}`,
        );
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log("Cloudinary response:", cloudinaryData);

      // Tạo đối tượng MediaItem từ dữ liệu Cloudinary
      const newItem: MediaItem = {
        id: `cloudinary-${cloudinaryData.public_id}`,
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
        cloudinaryPublicId: cloudinaryData.public_id
      };

      // Bước 2: Lưu trực tiếp vào Firebase từ client
      try {
        const savedId = await saveMediaToFirebase(newItem);
        
        if (savedId) {
          // Cập nhật ID nếu Firebase đã tạo ID mới
          newItem.id = savedId;
          
          toast({
            title: "Tải lên thành công",
            description: `Đã tải lên ${file.name} lên Cloudinary và lưu vào Firebase thành công`,
          });
        } else {
          toast({
            title: "Tải lên Cloudinary thành công",
            description: "Đã tải lên Cloudinary nhưng không thể lưu vào Firebase. Bạn vẫn có thể sử dụng tệp này.",
          });
        }
        
        // Thêm item mới vào danh sách hiển thị
        setMediaItems((prev) => [newItem, ...prev]);
      } catch (error) {
        console.error("Lỗi khi lưu vào Firebase:", error);
        
        // Vẫn hiển thị hình ảnh đã tải lên Cloudinary ngay cả khi lưu Firebase thất bại
        setMediaItems((prev) => [newItem, ...prev]);
        
        toast({
          title: "Tải lên Cloudinary thành công",
          description: "Đã tải lên Cloudinary nhưng không thể lưu vào Firebase. Bạn vẫn có thể sử dụng tệp này.",
        });
      }
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

  // Delete item - Xóa từ Firebase trước, sau đó xóa file vật lý nếu là file local
  const handleDeleteItem = async (item: MediaItem) => {
    try {
      console.log("Đang xóa item:", item);
      
      // Xóa từ Firebase trước - áp dụng cho tất cả các loại media
      const firebaseDeleteSuccess = await deleteFromFirebase(item);
      
      // Nếu xóa Firebase thành công và là file local, thì xóa file vật lý
      if (firebaseDeleteSuccess && item.source === "local") {
        // Extract filename from URL
        const filename = item.url.split("/").pop();
        
        if (filename) {
          try {
            console.log(`Đang xóa file vật lý: ${filename}`);
            // Delete file from server
            const response = await fetch(`/api/media?filename=${filename}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              console.warn(`Không thể xóa file từ server: ${response.statusText}`);
              toast({
                title: "Cảnh báo",
                description: "Đã xóa thông tin từ cơ sở dữ liệu nhưng không thể xóa file vật lý.",
                variant: "warning",
              });
            } else {
              console.log(`Đã xóa file vật lý thành công: ${filename}`);
            }
          } catch (localDeleteError) {
            console.error("Lỗi khi xóa file local:", localDeleteError);
            toast({
              title: "Cảnh báo",
              description: "Đã xóa thông tin từ cơ sở dữ liệu nhưng không thể xóa file vật lý.",
              variant: "warning",
            });
          }
        }
      }
      
      // Cập nhật UI sau khi xóa
      setMediaItems((prev) =>
        prev.filter((mediaItem) => mediaItem.id !== item.id),
      );
    } catch (error) {
      console.error("Lỗi khi xóa item:", error);
      toast({
        title: "Lỗi xóa",
        description: "Đã xảy ra lỗi khi xóa. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };
  
  // Hàm helper để xóa từ Firebase
  const deleteFromFirebase = async (mediaItem: MediaItem) => {
    if (!db) {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến cơ sở dữ liệu Firebase.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Đảm bảo item.id tồn tại
      const docId = mediaItem.id || '';
      if (!docId) {
        console.error('Không thể xóa từ Firebase: ID không hợp lệ');
        throw new Error('ID không hợp lệ');
      }
      
      console.log('Đang xóa từ Firebase với ID:', docId);
      const docRef = doc(db, 'media', docId);
      await deleteDoc(docRef);
      console.log('Đã xóa từ Firebase thành công:', docId);
      
      // Hiển thị thông báo thành công
      toast({
        title: "Xóa thành công",
        description: `Đã xóa ${mediaItem.name} khỏi thư viện`,
      });
      
      return true;
    } catch (firebaseError) {
      console.error('Lỗi khi xóa từ Firebase:', firebaseError);
      toast({
        title: "Lỗi xóa",
        description: "Không thể xóa từ cơ sở dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await handleDeleteItem(itemToDelete);
      
      if (selectedItems.includes(itemToDelete.id)) {
        setSelectedItems((prev) => prev.filter((id) => id !== itemToDelete.id));
      }

      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
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
      const itemsToDelete = mediaItems.filter((item) =>
        selectedItems.includes(item.id),
      );

      // Delete each item
      for (const item of itemsToDelete) {
        try {
          // Xóa từ Firebase trước
          const firebaseDeleteSuccess = await deleteFromFirebase(item);
          
          // Nếu xóa Firebase thành công và là file local, thì xóa file vật lý
          if (firebaseDeleteSuccess && item.source === "local") {
            // Extract filename from URL
            const filename = item.url.split("/").pop();
            
            if (filename) {
              try {
                console.log(`Đang xóa file vật lý (bulk): ${filename}`);
                // Delete file from server
                const response = await fetch(`/api/media?filename=${filename}`, {
                  method: "DELETE",
                });
                
                if (!response.ok) {
                  console.warn(`Không thể xóa file từ server: ${response.statusText}`);
                  toast({
                    title: "Cảnh báo",
                    description: `Đã xóa thông tin ${item.name} từ cơ sở dữ liệu nhưng không thể xóa file vật lý.`,
                    variant: "warning",
                  });
                } else {
                  console.log(`Đã xóa file vật lý thành công (bulk): ${filename}`);
                }
              } catch (localDeleteError) {
                console.error("Lỗi khi xóa file local:", localDeleteError);
                toast({
                  title: "Cảnh báo",
                  description: `Đã xóa thông tin ${item.name} từ cơ sở dữ liệu nhưng không thể xóa file vật lý.`,
                  variant: "warning",
                });
              }
            }
          }
        } catch (error) {
          console.error(`Lỗi khi xóa item ${item.id}:`, error);
          toast({
            title: "Lỗi xóa",
            description: `Không thể xóa ${item.name}. Vui lòng thử lại.`,
            variant: "destructive",
          });
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
                  <MediaItemCard
                    key={item.id}
                    item={item}
                    selected={selectedItems.includes(item.id)}
                    onToggleSelect={toggleItemSelection}
                    isSelectable={selectedItems.length > 0}
                    onDelete={(item) => {
                      setItemToDelete(item);
                      setConfirmDeleteOpen(true);
                    }}
                  />
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
                    <Input
                      value={selectedItem.url}
                      readOnly
                      className="pr-20"
                    />
                    <div className="absolute right-1 flex">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(selectedItem.url)}
                        title="Sao chép URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => window.open(selectedItem.url, "_blank")}
                        title="Mở trong tab mới"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
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
