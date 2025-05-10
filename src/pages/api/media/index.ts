import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import {
  getLocalMediaItems,
  uploadFileToLocal,
  deleteLocalFile,
} from "@/lib/mediaLibraryServer";
import { getFileType } from "@/lib/mediaLibrary";

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return getMediaItems(req, res);
    case "POST":
      return uploadMedia(req, res);
    case "DELETE":
      return deleteMedia(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get all media items
async function getMediaItems(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mediaItems = await getLocalMediaItems();

    return res.status(200).json({ items: mediaItems });
  } catch (error: any) {
    console.error("Error getting media items:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get media items" });
  }
}

// Upload media file
async function uploadMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          res.status(500).json({ error: "Failed to upload file" });
          return resolve(null);
        }

        const file = files.file?.[0];

        if (!file) {
          res.status(400).json({ error: "No file uploaded" });
          return resolve(null);
        }

        // Upload the file using our server-side function
        const mediaItem = await uploadFileToLocal(file);

        if (!mediaItem) {
          res
            .status(400)
            .json({ error: "Failed to process file. Unsupported file type." });
          return resolve(null);
        }

        res.status(201).json({ item: mediaItem });
        return resolve(null);
      });
    });
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to upload media" });
  }
}

// Delete media file
async function deleteMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ error: "Filename is required" });
    }

    const filePath = `/uploads/library/${filename}`;

    // Delete the file using our server-side function
    const success = await deleteLocalFile(filePath);

    if (!success) {
      return res.status(500).json({ error: "Failed to delete file" });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete media" });
  }
}
