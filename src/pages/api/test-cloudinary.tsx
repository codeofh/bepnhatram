import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const MEDIA_DB_PATH = path.join(
  process.cwd(),
  "public",
  "uploads",
  "media-db.json",
);

// Đảm bảo file JSON tồn tại
const ensureMediaDbExists = () => {
  if (!fs.existsSync(MEDIA_DB_PATH)) {
    fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify({ items: [] }));
  }
};

// Đọc dữ liệu từ file JSON
const readMediaDb = () => {
  ensureMediaDbExists();
  const data = fs.readFileSync(MEDIA_DB_PATH, "utf-8");
  return JSON.parse(data);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Read the Cloudinary items from the database
    const db = readMediaDb();

    // Logging for debug purposes
    console.log("Current Cloudinary items in DB:", db.items.length);

    // Add a sample Cloudinary item if none exist
    if (db.items.length === 0) {
      const sampleItem = {
        id: `cloudinary-test-${Date.now()}`,
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
        tags: ["logo", "test"],
      };

      db.items.push(sampleItem);
      fs.writeFileSync(MEDIA_DB_PATH, JSON.stringify(db, null, 2));
      console.log("Added sample Cloudinary item");
    }

    return res.status(200).json({ success: true, items: db.items });
  } catch (error: any) {
    console.error("Error in test Cloudinary API:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
