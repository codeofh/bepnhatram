import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

// Đường dẫn đến file JSON lưu trữ thông tin media
const MEDIA_DB_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "media-db.json",
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Kiểm tra xem file JSON có tồn tại không
    if (!fs.existsSync(MEDIA_DB_PATH)) {
      // Tạo file với mảng rỗng nếu không tồn tại
      fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify({ items: [] }, null, 2));

      return res.status(200).json({
        status: "Database file created",
        path: MEDIA_DB_PATH,
        items: [],
      });
    }

    // Đọc nội dung file
    const fileContent = fs.readFileSync(MEDIA_DB_PATH, "utf-8");

    try {
      // Thử parse JSON
      const data = JSON.parse(fileContent);

      // Thêm một mục kiểm tra nếu không có mục nào
      if (!data.items || data.items.length === 0) {
        const sampleItem = {
          id: `cloudinary-debug-${Date.now()}`,
          name: "logo_ygaqoc.jpg",
          url: "https://res.cloudinary.com/dhtqumqcx/image/upload/v1746870287/logo_ygaqoc.jpg",
          thumbnail:
            "https://res.cloudinary.com/dhtqumqcx/image/upload/v1746870287/logo_ygaqoc.jpg",
          type: "image",
          source: "cloudinary",
          size: 213251,
          dimensions: {
            width: 1000,
            height: 1000,
          },
          cloudinaryPublicId: "logo_ygaqoc",
          createdAt: new Date(),
          tags: ["debug"],
        };

        data.items = [sampleItem];
        fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify(data, null, 2));

        return res.status(200).json({
          status: "Sample item added",
          path: MEDIA_DB_PATH,
          sampleItem,
          items: data.items,
        });
      }

      return res.status(200).json({
        status: "Database read successfully",
        path: MEDIA_DB_PATH,
        itemCount: data.items.length,
        items: data.items,
      });
    } catch (parseError) {
      // Nếu không thể parse, file có thể bị hỏng
      // Tạo mới file với dữ liệu đúng
      const newData = { items: [] };
      fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify(newData, null, 2));

      return res.status(200).json({
        status: "Database file was corrupted and has been reset",
        path: MEDIA_DB_PATH,
        error: parseError.message,
        items: [],
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Internal server error",
      path: MEDIA_DB_PATH,
    });
  }
}
