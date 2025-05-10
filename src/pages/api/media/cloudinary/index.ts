import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Định nghĩa kiểu dữ liệu cho item media
interface CloudinaryMediaItem {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  type: "image" | "video";
  source: "cloudinary";
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  cloudinaryPublicId: string;
  createdAt: Date;
  tags?: string[];
}

// Đường dẫn đến file JSON lưu trữ thông tin media
const MEDIA_DB_PATH = path.join(process.cwd(), "public", "uploads", "media-db.json");

// Đảm bảo file JSON tồn tại
const ensureMediaDbExists = () => {
  if (!fs.existsSync(MEDIA_DB_PATH)) {
    fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify({ items: [] }));
  }
};

// Đọc dữ liệu từ file JSON
const readMediaDb = (): { items: CloudinaryMediaItem[] } => {
  ensureMediaDbExists();
  const data = fs.readFileSync(MEDIA_DB_PATH, "utf-8");
  return JSON.parse(data);
};

// Ghi dữ liệu vào file JSON
const writeMediaDb = (data: { items: CloudinaryMediaItem[] }) => {
  ensureMediaDbExists();
  fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify(data, null, 2));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Xử lý các phương thức HTTP khác nhau
  switch (req.method) {
    case "GET":
      return getCloudinaryMediaItems(req, res);
    case "POST":
      return saveCloudinaryMedia(req, res);
    case "DELETE":
      return deleteCloudinaryMedia(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Lấy tất cả các item media từ Cloudinary
async function getCloudinaryMediaItems(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = readMediaDb();
    return res.status(200).json({ items: db.items });
  } catch (error: any) {
    console.error("Error getting Cloudinary media items:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get Cloudinary media items" });
  }
}

// Lưu thông tin media từ Cloudinary
async function saveCloudinaryMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Lấy thông tin từ form data
    const { name, url, thumbnail, type, source, size, width, height, cloudinaryPublicId } = req.body;

    // Tạo item media mới
    const newItem: CloudinaryMediaItem = {
      id: `cloudinary-${uuidv4()}`,
      name,
      url,
      thumbnail,
      type: type as "image" | "video",
      source: "cloudinary",
      size: parseInt(size, 10),
      dimensions: {
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      },
      cloudinaryPublicId,
      createdAt: new Date(),
      tags: [],
    };

    // Đọc dữ liệu hiện tại
    const db = readMediaDb();

    // Thêm item mới vào danh sách
    db.items.unshift(newItem);

    // Lưu dữ liệu
    writeMediaDb(db);

    // Trả về kết quả
    return res.status(201).json({ item: newItem });
  } catch (error: any) {
    console.error("Error saving Cloudinary media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to save Cloudinary media" });
  }
}

// Xóa media từ Cloudinary
async function deleteCloudinaryMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID is required" });
    }

    // Đọc dữ liệu hiện tại
    const db = readMediaDb();

    // Tìm item cần xóa
    const itemIndex = db.items.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Xóa item khỏi danh sách
    db.items.splice(itemIndex, 1);

    // Lưu dữ liệu
    writeMediaDb(db);

    // Trả về kết quả
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error deleting Cloudinary media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete Cloudinary media" });
  }
}