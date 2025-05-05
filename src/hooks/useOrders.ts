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

      // Tạo đơn hàng với dữ liệu cơ bản
      const newOrder = {
        userId: user ? user.uid : null,
        ...orderData,
        status: 'pending' as OrderStatus,
        payment: {
          ...orderData.payment,
          status: 'pending',
          paidAt: null
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Thêm vào Firestore
      const ordersCollection = collection(db, 'orders');
      const docRef = await addDoc(ordersCollection, newOrder);
      
      // Cập nhật ID
      await updateDoc(docRef, {
        id: docRef.id
      });

      toast({
        title: "Đặt hàng thành công",
        description: `Mã đơn hàng: ${docRef.id}`,
        variant: "success",
      });

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
        setError("Không tìm thấy đơn hàng");
        return null;
      }
      
      // Nếu đơn hàng thuộc về người dùng khác và người dùng hiện tại không phải admin
      // thì không cho phép xem
      const orderData = orderDoc.data() as Order;
      if (orderData.userId && user?.uid !== orderData.userId) {
        setError("Bạn không có quyền xem đơn hàng này");
        return null;
      }
      
      return orderData;
    } catch (err: any) {
      console.error('Lỗi khi lấy đơn hàng:', err);
      setError(`Không thể lấy thông tin đơn hàng: ${err.message}`);
      return null;
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
        throw new Error("Không tìm thấy đơn hàng");
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
        title: "Cập nhật thanh toán thành công",
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