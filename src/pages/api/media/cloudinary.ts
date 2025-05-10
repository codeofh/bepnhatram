import { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "bXR9eVM7TG5_KzVprFFApWilbdY",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_SITE_URL,
  // Add your production domain
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Handle CORS
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Check if Cloudinary is properly configured
  if (!process.env.CLOUDINARY_API_SECRET) {
    return res
      .status(500)
      .json({ error: "Cloudinary API secret is not configured" });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return getCloudinaryAssets(req, res);
    case "POST":
      return generateSignature(req, res);
    case "DELETE":
      return deleteAsset(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get Cloudinary assets
async function getCloudinaryAssets(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { next_cursor, max_results = 20 } = req.query;

    const result = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      max_results: Number(max_results),
      next_cursor: next_cursor as string,
    });

    // Format the response to match our MediaItem structure
    const items = result.resources.map((resource: any) => ({
      id: `cloudinary-${resource.public_id}`,
      name: resource.public_id.split("/").pop() || resource.public_id,
      url: resource.secure_url,
      thumbnail: resource.secure_url,
      type: "image",
      source: "cloudinary",
      size: resource.bytes,
      dimensions: {
        width: resource.width,
        height: resource.height,
      },
      createdAt: new Date(resource.created_at),
      tags: resource.tags || [],
    }));

    return res.status(200).json({
      items,
      next_cursor: result.next_cursor,
    });
  } catch (error: any) {
    console.error("Error getting Cloudinary assets:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get Cloudinary assets" });
  }
}

// Generate signature for authenticated uploads
async function generateSignature(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { folder = "media_library" } = req.body;

    // Create the timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Set upload parameters
    const params = {
      timestamp,
      folder,
      // Add any other upload parameters as needed
    };

    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo",
      apiKey: process.env.CLOUDINARY_API_KEY || "bXR9eVM7TG5_KzVprFFApWilbdY",
      folder,
    });
  } catch (error: any) {
    console.error("Error generating signature:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to generate signature" });
  }
}

// Delete a Cloudinary asset
async function deleteAsset(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    // Delete the asset
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      return res
        .status(200)
        .json({ success: true, message: "Asset deleted successfully" });
    } else {
      return res
        .status(400)
        .json({ error: `Failed to delete asset: ${result.result}` });
    }
  } catch (error: any) {
    console.error("Error deleting Cloudinary asset:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete Cloudinary asset" });
  }
}
