import { useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Order, CreateOrderData, OrderStatus } from '@/types/order';

// Utility function to sanitize data for Firestore
// Firebase doesn't allow undefined values, convert them to null
const sanitizeForFirestore = (data: any): any => {
  if (data === undefined) {
    return null;
  }
  
  if (data === null || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  
  const sanitizedData: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      sanitizedData[key] = sanitizeForFirestore(value);
    }
  }
  
  return sanitizedData;
};

// Hook để thao tác với đơn hàng
export function useOrders() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo đơn hàng mới
  const createOrder = async (orderData: CreateOrderData): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      // Tạo mã đơn hàng với tiền tố yyMMdd + 8 ký tự ngẫu nhiên từ A-Z và 0-9
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2); // Lấy 2 chữ số cuối của năm
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Tháng định dạng 2 chữ số
      const day = now.getDate().toString().padStart(2, '0'); // Ngày định dạng 2 ch�� số
      const datePrefix = `${year}${month}${day}`;

      // Tạo 8 ký tự ngẫu nhiên từ A-Z và 0-9
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomChars = '';
      for (let i = 0; i < 8; i++) {
        randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Mã đơn hàng đầy đủ
      const orderCode = `${datePrefix}${randomChars}`;

      // Sanitize order data to prevent undefined values
      const sanitizedOrderData = sanitizeForFirestore(orderData);

      // Thêm vào Firestore
      const ordersCollection = collection(db, 'orders');
      const docRef = await addDoc(ordersCollection, {
        userId: user ? user.uid : null,
        ...sanitizedOrderData,
        status: 'pending' as OrderStatus,
        payment: {
          ...(sanitizedOrderData.payment || {}),
          status: 'pending',
          paidAt: null
        },
        orderCode: orderCode, // Mã đơn hàng hiển thị
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Cập nhật thêm ID Firestore vào đơn hàng
      await updateDoc(docRef, {
        id: docRef.id
      });

      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${orderCode}`,
        variant: "success",
      });

      // Trả về ID của Firestore để sử dụng cho navigation
      return docRef.id;
    } catch (err: any) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      setError(`Đặt hàng thất bại: ${err.message}`);

      toast({
        title: "Đặt hàng thất bại",
        description: err.message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy một đơn hàng từ ID
  const getOrder = async (orderId: string): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const orderDoc = await getDoc(doc(db, 'orders', orderId));

      if (!orderDoc.exists()) {
        const errMsg = "Không tìm thấy đơn hàng";
        setError(errMsg);
        throw new Error(errMsg);
      }

      // Nếu đơn hàng thuộc về người dùng khác và người dùng hiện tại không phải admin
      // thì không cho phép xem
      const orderData = orderDoc.data() as Order;
      if (orderData.userId && user?.uid !== orderData.userId) {
        const errMsg = "Bạn không có quyền xem đơn hàng này";
        setError(errMsg);
        throw new Error(errMsg);
      }

      return orderData;
    } catch (err: any) {
      console.error('Lỗi khi lấy đơn hàng:', err);

      // Xử lý các loại lỗi phổ biến từ Firestore
      let errorMessage = err.message || "Không thể lấy thông tin đơn hàng";

      if (err.code === 'permission-denied') {
        errorMessage = 'Bạn không có quyền truy cập vào dữ liệu này';
      } else if (err.code === 'unavailable' || err.code === 'failed-precondition') {
        errorMessage = 'Kết nối tới máy chủ bị gián đoạn. Vui lòng kiểm tra kết nối internet của bạn và thử lại';
      } else if (err.code === 'resource-exhausted') {
        errorMessage = 'Đã vượt quá giới hạn truy vấn cho phép. Vui lòng thử lại sau ít phút';
      } else if (err.code === 'not-found') {
        errorMessage = 'Không tìm thấy dữ liệu đơn hàng';
      } else if (err.code === 'cancelled') {
        errorMessage = 'Yêu cầu đã bị hủy';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đơn hàng của người dùng hiện tại
  const getUserOrders = async (): Promise<Order[]> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError("Bạn cần đăng nhập để xem đơn hàng");
        return [];
      }

      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(ordersQuery);

      return snapshot.docs.map(doc => doc.data() as Order);
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setError(`Không thể lấy danh sách đơn hàng: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Bạn cần đăng nhập để cập nhật đơn hàng");
      }

      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Không t��m thấy đơn hàng");
      }

      const orderData = orderDoc.data() as Order;

      // Chỉ cho phép người dùng cập nhật đơn hàng của chính họ
      // hoặc là admin (sẽ bổ sung logic kiểm tra admin sau)
      if (orderData.userId && orderData.userId !== user.uid) {
        throw new Error("Bạn không có quyền cập nhật đơn hàng này");
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      // Nếu hủy đơn hàng, thêm lý do
      if (status === 'cancelled' && reason) {
        updateData.cancellationReason = reason;
      }

      // Nếu trạng thái là shipping, cập nhật thời gian giao hàng
      if (status === 'shipping') {
        updateData['shipping.shippedAt'] = Timestamp.now();
      }

      // Nếu trạng thái là completed, cập nhật thời gian hoàn thành
      if (status === 'completed') {
        updateData['shipping.deliveredAt'] = Timestamp.now();
      }

      await updateDoc(orderRef, updateData);

      toast({
        title: "Cập nhật thành công",
        description: `Đơn hàng #${orderId} đã được cập nhật thành ${status}`,
        variant: "success",
      });

      return true;
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
      setError(`Không thể cập nhật trạng thái đơn hàng: ${err.message}`);

      toast({
        title: "Cập nhật thất bại",
        description: err.message,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái thanh toán
  const updatePaymentStatus = async (orderId: string, status: 'pending' | 'completed' | 'failed', transactionId?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Bạn cần đăng nhập để cập nhật thanh toán");
      }

      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      const updateData: any = {
        'payment.status': status,
        updatedAt: serverTimestamp()
      };

      if (status === 'completed') {
        updateData['payment.paidAt'] = Timestamp.now();
      }

      if (transactionId) {
        updateData['payment.transactionId'] = transactionId;
      }

      await updateDoc(orderRef, updateData);

      toast({
        title: "Cập nh��t thanh toán thành công",
        description: `Trạng thái thanh toán đã được cập nhật thành ${status}`,
        variant: "success",
      });

      return true;
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', err);
      setError(`Không thể cập nhật trạng thái thanh toán: ${err.message}`);

      toast({
        title: "Cập nhật thất bại",
        description: err.message,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    getOrder,
    getUserOrders,
    updateOrderStatus,
    updatePaymentStatus,
    loading,
    error
  };
}