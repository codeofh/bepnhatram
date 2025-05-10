import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaItem } from "@/lib/mediaLibrary";
import { ExternalLink, Video } from "lucide-react";
import { formatFileSize } from "@/lib/mediaLibrary";

interface MediaItemCardProps {
  item: MediaItem;
  selected?: boolean;
  onSelect?: (item: MediaItem) => void;
  onToggleSelect?: (id: string) => void;
  isSelectable?: boolean;
  showExternalLink?: boolean;
}

export function MediaItemCard({
  item,
  selected,
  onSelect,
  onToggleSelect,
  isSelectable = false,
  showExternalLink = true,
}: MediaItemCardProps) {
  const handleClick = () => {
    if (isSelectable && onToggleSelect) {
      onToggleSelect(item.id);
    } else if (onSelect) {
      onSelect(item);
    }
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, "_blank");
  };

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md group ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      onClick={handleClick}
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
            selected ? "bg-primary" : "bg-white"
          } ${isSelectable ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSelect) onToggleSelect(item.id);
          }}
        >
          {selected && (
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

        {/* External link button */}
        {showExternalLink && (
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            onClick={handleOpenExternal}
            title="Mở trong tab mới"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}

        {/* Source badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 right-2 text-xs"
        >
          {item.source === "local" ? "Local" : "Cloudinary"}
        </Badge>
      </div>
      <CardContent className="p-3">
        <div className="text-sm font-medium line-clamp-1" title={item.name}>
          {item.name}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatFileSize(item.size || 0)}
        </div>
      </CardContent>
    </Card>
  );
}
