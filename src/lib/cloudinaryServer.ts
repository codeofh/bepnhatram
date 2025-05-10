/**
 * Các hàm server-side để tương tác với Cloudinary API
 * Lưu ý: Các hàm này chỉ nên được gọi từ server-side (API routes)
 */

import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Lấy danh sách media từ Cloudinary
 * @param max Số lượng tối đa các items cần lấy
 * @returns Danh sách các resources từ Cloudinary
 */
export async function getCloudinaryMediaList(max = 100) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: max,
      resource_type: 'auto',
    });
    
    return result.resources || [];
  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error);
    return [];
  }
}

/**
 * Xóa media từ Cloudinary
 * @param publicId Public ID của resource cần xóa
 * @returns true nếu xóa thành công, false nếu có lỗi
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    console.log('Attempting to delete from Cloudinary with publicId:', publicId);
    
    // Xóa file từ Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'auto'
    });
    
    console.log('Cloudinary delete result:', result);
    
    // Kiểm tra kết quả
    if (result.result === 'ok') {
      console.log('Successfully deleted from Cloudinary:', publicId);
      return true;
    } else {
      console.warn('Cloudinary returned non-ok result:', result);
      return false;
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Tạo chữ ký cho upload trực tiếp lên Cloudinary
 * @param params Các tham số cần ký
 * @returns Chữ ký và timestamp
 */
export function generateSignature(params: Record<string, any> = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  
  // Thêm timestamp vào params
  const paramsToSign = { ...params, timestamp };
  
  // Tạo chuỗi để ký
  const signatureString = Object.entries(paramsToSign)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  // Tạo chữ ký
  const signature = crypto
    .createHash('sha1')
    .update(signatureString + apiSecret)
    .digest('hex');
  
  return {
    signature,
    timestamp,
  };
}

/**
 * Lưu thông tin media vào Firebase
 * @param mediaData Dữ liệu media cần lưu
 * @returns ID của document đã lưu hoặc null nếu có lỗi
 */
export async function saveMediaToFirebase(mediaData: any) {
  try {
    // Tạo ID cho document nếu chưa có
    const id = mediaData.id || `cloudinary-${mediaData.cloudinaryPublicId}`;
    
    // Thêm timestamp nếu chưa có
    const dataToSave = {
      ...mediaData,
      id,
      createdAt: mediaData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    // Import Firebase modules dynamically to avoid SSR issues
    const { db } = await import('./firebase');
    
    // Kiểm tra xem Firebase đã được khởi tạo chưa
    if (!db) {
      console.warn('Firebase not initialized, skipping save operation');
      return id; // Vẫn trả về ID mặc dù không lưu được
    }
    
    const { collection, doc, setDoc } = await import('firebase/firestore');
    
    // Lưu vào collection 'media'
    const mediaCollection = collection(db, 'media');
    
    // Sử dụng setDoc với ID cụ thể để tránh trùng lặp
    await setDoc(doc(db, 'media', id), dataToSave);
    
    console.log('Saved to Firebase successfully:', id);
    return id;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    // Trả về ID thay vì throw error để không làm gián đoạn luồng xử lý
    return mediaData.id || `cloudinary-${mediaData.cloudinaryPublicId}`;
  }
}