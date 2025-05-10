// Media library type definitions

export interface MediaDimensions {
  width: number;
  height: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type: "image" | "video" | "other";
  source: "local" | "cloudinary";
  size?: number;
  dimensions?: MediaDimensions;
  createdAt: Date;
  tags?: string[];
  path?: string;
  cloudinaryPublicId?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  item?: MediaItem;
  error?: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface MediaListResponse {
  items: MediaItem[];
  next_cursor?: string;
}
