import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { MediaItem } from "@/lib/mediaLibrary";
import { getCloudinaryMediaList, deleteFromCloudinary, saveMediaToFirebase } from "@/lib/cloudinaryServer";
import formidable from "formidable";

// Cấu hình để Next.js không phân tích body request
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
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

// Lấy tất cả các item media từ Cloudinary và Firebase
async function getCloudinaryMediaItems(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Lấy danh sách media từ Firebase trước
    let firebaseItems: MediaItem[] = [];
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      
      if (db) {
        const mediaCollection = collection(db, 'media');
        const mediaQuery = query(mediaCollection, where("source", "==", "cloudinary"));
        const querySnapshot = await getDocs(mediaQuery);
        
        firebaseItems = querySnapshot.docs.map(doc => doc.data() as MediaItem);
        console.log(`Found ${firebaseItems.length} items in Firebase`);
      }
    } catch (firebaseError) {
      console.error("Error fetching from Firebase:", firebaseError);
      // Tiếp tục xử lý ngay cả khi không lấy được từ Firebase
    }
    
    // Nếu có dữ liệu từ Firebase, trả về luôn
    if (firebaseItems.length > 0) {
      return res.status(200).json({ items: firebaseItems });
    }
    
    // Nếu không có dữ liệu từ Firebase, lấy từ Cloudinary API
    const cloudinaryResources = await getCloudinaryMediaList(100);
    
    // Chuyển đổi thành định dạng MediaItem
    const items: MediaItem[] = cloudinaryResources.map((resource: any) => ({
      id: `cloudinary-${resource.public_id}`,
      name: resource.public_id.split('/').pop() || resource.public_id,
      url: resource.secure_url,
      thumbnail: resource.secure_url,
      type: resource.resource_type === "image" ? "image" : "video",
      source: "cloudinary",
      size: resource.bytes,
      dimensions: {
        width: resource.width || 0,
        height: resource.height || 0,
      },
      cloudinaryPublicId: resource.public_id,
      createdAt: new Date(resource.created_at),
      tags: resource.tags || [],
      path: resource.secure_url,
      uploadSource: "cloudinary-api",
    }));
    
    // Lưu các items vào Firebase để lần sau không cần gọi Cloudinary API
    try {
      for (const item of items) {
        await saveMediaToFirebase(item);
      }
      console.log(`Saved ${items.length} items to Firebase`);
    } catch (saveError) {
      console.error("Error saving items to Firebase:", saveError);
    }
    
    return res.status(200).json({ items });
  } catch (error: any) {
    console.error("Error getting Cloudinary media items:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get Cloudinary media items" });
  }
}

// Hàm parse form data
const parseForm = async (req: NextApiRequest) => {
  return new Promise<{ fields: formidable.Fields }>((resolve, reject) => {
    const form = formidable();
    form.parse(req, (err, fields) => {
      if (err) return reject(err);
      resolve({ fields });
    });
  });
};

// Lưu thông tin media từ Cloudinary
async function saveCloudinaryMedia(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse form data
    const { fields } = await parseForm(req);
    
    console.log("Form fields:", fields);

    // Lấy thông tin từ form data
    const name = fields.name?.[0] || '';
    const url = fields.url?.[0] || '';
    const thumbnail = fields.thumbnail?.[0] || '';
    const type = fields.type?.[0] || 'image';
    const size = fields.size?.[0] || '0';
    const width = fields.width?.[0] || '0';
    const height = fields.height?.[0] || '0';
    const cloudinaryPublicId = fields.cloudinaryPublicId?.[0] || '';
    const uploadSource = fields.uploadSource?.[0] || 'admin-panel';

    if (!url || !cloudinaryPublicId) {
      return res
        .status(400)
        .json({ error: "Missing required fields url or cloudinaryPublicId" });
    }

    // Tạo item media mới
    const newItem: MediaItem = {
      id: `cloudinary-${cloudinaryPublicId}`, // Sử dụng cloudinaryPublicId làm phần của ID
      name: name || "Unnamed file",
      url,
      thumbnail: thumbnail || url,
      type: (type as "image" | "video") || "image",
      source: "cloudinary",
      size: parseInt(size, 10) || 0,
      dimensions: {
        width: parseInt(width, 10) || 0,
        height: parseInt(height, 10) || 0,
      },
      cloudinaryPublicId,
      createdAt: new Date(),
      tags: [],
      uploadSource: uploadSource || "admin-panel", // Thêm thông tin nguồn upload
      path: url, // Đường dẫn đầy đủ là URL
    };
      
    // Lưu vào Firebase
    try {
      const savedId = await saveMediaToFirebase(newItem);
      console.log("Media saved to Firebase with ID:", savedId);
      
      // Trả về kết quả
      return res.status(201).json({ 
        item: newItem,
        firebaseId: savedId
      });
    } catch (firebaseError: any) {
      console.error("Error saving to Firebase:", firebaseError);
      // Vẫn trả về thành công nhưng với thông báo lỗi Firebase
      return res.status(201).json({ 
        item: newItem,
        firebaseError: firebaseError.message || "Failed to save to Firebase"
      });
    }
  } catch (error: any) {
    console.error("Error saving Cloudinary media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to save Cloudinary media" });
  }
}

// Xóa media từ Cloudinary
async function deleteCloudinaryMedia(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "ID is required" });
    }

    console.log("Deleting media with ID:", id);

    // Kiểm tra xem ID có phải là publicId trực tiếp không
    let publicId = id;
    
    // Nếu ID có định dạng cloudinary-{publicId}, trích xuất publicId
    if (id.startsWith('cloudinary-')) {
      const publicIdMatch = id.match(/^cloudinary-(.+)$/);
      if (publicIdMatch && publicIdMatch[1]) {
        publicId = publicIdMatch[1];
      }
    }
    
    console.log("Extracted publicId:", publicId);
    
    // Xóa media từ Cloudinary
    const success = await deleteFromCloudinary(publicId);
    
    if (!success) {
      console.warn("Failed to delete from Cloudinary, but will continue to delete from Firebase");
    } else {
      console.log("Successfully deleted from Cloudinary");
    }

    // Xóa từ Firebase - đây là bước quan trọng nhất
    let firebaseSuccess = false;
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      
      if (db) {
        // Tìm document ID trong Firebase dựa trên cloudinaryPublicId nếu cần
        let docId = id;
        
        // Nếu không tìm thấy document với ID trực tiếp, tìm kiếm theo cloudinaryPublicId
        try {
          await deleteDoc(doc(db, 'media', docId));
          console.log("Deleted from Firebase with direct ID:", docId);
          firebaseSuccess = true;
        } catch (directDeleteError) {
          console.warn("Could not delete with direct ID, trying to find by cloudinaryPublicId");
          
          // Tìm document có cloudinaryPublicId khớp với publicId
          const mediaCollection = collection(db, 'media');
          const q = query(mediaCollection, where("cloudinaryPublicId", "==", publicId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const docToDelete = querySnapshot.docs[0];
            await deleteDoc(doc(db, 'media', docToDelete.id));
            console.log("Deleted from Firebase by cloudinaryPublicId:", docToDelete.id);
            firebaseSuccess = true;
          } else {
            console.warn("No matching document found in Firebase");
          }
        }
      }
    } catch (firebaseError) {
      console.error("Error deleting from Firebase:", firebaseError);
    }
    
    // Trả về kết quả - luôn trả về thành công nếu đã xóa được từ Firebase
    if (firebaseSuccess) {
      return res.status(200).json({ 
        success: true, 
        cloudinaryDeleted: success,
        firebaseDeleted: firebaseSuccess,
        message: success ? "Đã xóa từ cả Cloudinary và Firebase" : "Đã xóa từ Firebase nhưng không xóa được từ Cloudinary"
      });
    } else {
      return res.status(500).json({ 
        error: "Không thể xóa từ Firebase",
        cloudinaryDeleted: success,
        firebaseDeleted: firebaseSuccess
      });
    }
  } catch (error: any) {
    console.error("Error deleting Cloudinary media:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete Cloudinary media" });
  }
}
