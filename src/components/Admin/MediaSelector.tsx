import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  ImageIcon,
  Search,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaItem, useMediaLibrary } from "@/lib/mediaLibrary";
import { useDropzone } from "react-dropzone";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface MediaSelectorProps {
  onSelect: (media: MediaItem) => void;
  selectedMedia?: MediaItem;
  allowedTypes?: Array<"image" | "video">;
  buttonText?: string;
}

export function MediaSelector({
  onSelect,
  selectedMedia,
  allowedTypes = ["image", "video"],
  buttonText = "Chọn phương tiện",
}: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { isLoading, mediaItems, uploadFile } = useMediaLibrary();

  // File dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const item = await uploadFile(file);
        if (item) {
          onSelect(item);
          setOpen(false);
        }
      }
    },
    accept: {
      "image/*": allowedTypes.includes("image")
        ? [".jpeg", ".jpg", ".png", ".gif", ".webp"]
        : [],
      "video/*": allowedTypes.includes("video")
        ? [".mp4", ".webm", ".ogg"]
        : [],
    },
  });

  // Filter media items based on search, tab, and allowed types
  const filteredMediaItems = mediaItems
    .filter((item) => {
      // Filter by allowed types
      if (!allowedTypes.includes(item.type)) return false;

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
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <div className="flex items-start gap-3">
        {selectedMedia ? (
          <div className="relative rounded-md border overflow-hidden bg-gray-50 h-24 w-24 flex items-center justify-center group">
            {selectedMedia.type === "image" ? (
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.name}
                fill
                className="object-cover"
              />
            ) : (
              <Video className="h-10 w-10 text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8"
                onClick={() => onSelect(null as any)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-24 w-24 border border-dashed rounded-md flex items-center justify-center bg-gray-50">
            <ImageIcon className="h-10 w-10 text-gray-300" />
          </div>
        )}

        <div className="flex-1 pt-1">
          {selectedMedia && (
            <div className="text-sm font-medium mb-1 line-clamp-1">
              {selectedMedia.name}
            </div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant={selectedMedia ? "outline" : "default"} size="sm">
                {buttonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Thư viện phư��ng tiện</DialogTitle>
                <DialogDescription>
                  Chọn một phương tiện từ thư viện hoặc tải lên một tệp mới.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3 my-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm phương tiện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div
                  {...getRootProps()}
                  className="cursor-pointer bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary/30 rounded-md px-4 py-2 text-sm font-medium text-primary flex items-center gap-2"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{isDragActive ? "Thả để tải lên" : "Tải lên"}</span>
                  <input {...getInputProps()} />
                </div>
              </div>

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

              <ScrollArea className="flex-1 -mx-6 px-6">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-32 w-full rounded-md"
                      />
                    ))}
                  </div>
                ) : filteredMediaItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium">
                      Không tìm thấy phương tiện
                    </h3>
                    <p className="text-gray-500 mt-1 text-sm">
                      {searchQuery
                        ? "Không có kết quả phù hợp với tìm kiếm của bạn"
                        : "Hãy tải lên phương tiện để bắt đầu"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                    {filteredMediaItems.map((item) => (
                      <div
                        key={item.id}
                        className={`relative rounded-md border overflow-hidden cursor-pointer transition-all ${
                          selectedMedia?.id === item.id
                            ? "ring-2 ring-primary"
                            : "hover:ring-1 hover:ring-primary/50"
                        }`}
                        onClick={() => {
                          onSelect(item);
                          setOpen(false);
                        }}
                      >
                        <div className="h-32 bg-gray-100">
                          {item.type === "image" ? (
                            <Image
                              src={item.thumbnail || item.url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <Video className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <div
                            className="text-xs font-medium line-clamp-1"
                            title={item.name}
                          >
                            {item.name}
                          </div>
                        </div>

                        {/* Source badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-xs"
                        >
                          {item.source === "local" ? "Local" : "Cloudinary"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Hủy bỏ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedMedia && (
        <div className="mt-2 relative">
          <Input
            value={selectedMedia.url}
            readOnly
            className="text-sm text-muted-foreground pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 absolute right-1 top-0"
            onClick={() => window.open(selectedMedia.url, "_blank")}
            title="Mở trong tab mới"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
