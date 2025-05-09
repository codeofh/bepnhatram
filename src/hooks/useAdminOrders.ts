import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types/order";

export function useAdminOrders() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy tất cả đơn hàng với khả năng lọc và phân trang
  const getAllOrders = async (
    status?: OrderStatus,
    startDate?: Date,
    endDate?: Date,
    searchTerm?: string,
    page: number = 1,
    itemsPerPage: number = 20,
  ): Promise<{ items: Order[]; totalItems: number; totalPages: number }> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      // Đầu tiên, lấy tổng số đơn hàng để tính toán phân trang
      // Có thể phải lọc theo trạng thái
      let countQuery = collection(db, "orders");
      if (status) {
        countQuery = query(countQuery, where("status", "==", status)) as any;
      }

      const countSnapshot = await getDocs(countQuery);
      const totalItems = countSnapshot.size;

      // Tính tổng số trang
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      // Đảm bảo trang hiện tại hợp lệ
      const validPage = Math.max(1, Math.min(page, totalPages || 1));

      // Query chính với sắp xếp và các bộ lọc
      let ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
      );

      // Áp dụng bộ lọc status nếu có
      if (status) {
        ordersQuery = query(ordersQuery, where("status", "==", status));
      }

      // Chưa triển khai lọc theo thời gian và tìm kiếm ở cấp độ query
      // vì cần compound indexes. Sẽ lọc sau khi lấy dữ liệu

      // Lấy tất cả đơn hàng (để lọc client-side)
      // Trong ứng dụng thực tế với nhiều dữ liệu, cần cải thiện cách làm này
      const snapshot = await getDocs(ordersQuery);

      // Dữ liệu cơ bản
      let allOrders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
        } as Order;
      });

      // Lọc theo ngày nếu có
      if (startDate) {
        const startTimestamp = Timestamp.fromDate(startDate);
        allOrders = allOrders.filter(
          (order) => order.createdAt.seconds >= startTimestamp.seconds,
        );
      }

      if (endDate) {
        const endTimestamp = Timestamp.fromDate(endDate);
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999); // Kết thúc ngày
        const endTimestampWithTime = Timestamp.fromDate(endDateWithTime);
        allOrders = allOrders.filter(
          (order) => order.createdAt.seconds <= endTimestampWithTime.seconds,
        );
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm && searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        allOrders = allOrders.filter(
          (order) =>
            order.id.toLowerCase().includes(term) ||
            (order.orderCode && order.orderCode.toLowerCase().includes(term)) ||
            order.customer.name.toLowerCase().includes(term) ||
            order.customer.email?.toLowerCase().includes(term) ||
            order.customer.phone.toLowerCase().includes(term),
        );
      }

      // Tính toán lại tổng số items và pages sau khi lọc
      const filteredTotalItems = allOrders.length;
      const filteredTotalPages = Math.ceil(filteredTotalItems / itemsPerPage);

      // Áp dụng phân trang
      const startIndex = (validPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pagedOrders = allOrders.slice(startIndex, endIndex);

      return {
        items: pagedOrders,
        totalItems: filteredTotalItems,
        totalPages: filteredTotalPages,
      };
    } catch (err: any) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", err);

      // Xử lý các loại lỗi phổ biến từ Firestore
      let errorMessage = `Không thể lấy danh sách đơn hàng`;

      if (err.code === "permission-denied") {
        errorMessage = "Bạn không có quyền truy cập vào dữ liệu này";
      } else if (
        err.code === "unavailable" ||
        err.code === "failed-precondition"
      ) {
        errorMessage =
          "Kết nối tới máy chủ bị gián đoạn. Vui lòng kiểm tra kết nối internet của bạn và thử lại";
      } else if (err.code === "resource-exhausted") {
        errorMessage =
          "Đã vượt quá giới hạn truy vấn cho phép. Vui lòng thử lại sau ít phút";
      } else if (err.code === "not-found") {
        errorMessage = "Không tìm thấy dữ liệu đơn hàng";
      } else if (err.code === "cancelled") {
        errorMessage = "Yêu cầu đã bị hủy";
      } else if (err.message) {
        errorMessage = `${errorMessage}: ${err.message}`;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Lấy đơn hàng theo ID (cho admin, không cần kiểm tra quyền sở hữu)
  const getOrderById = async (orderId: string): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const orderDoc = await getDoc(doc(db, "orders", orderId));

      if (!orderDoc.exists()) {
        setError("Không tìm thấy đơn hàng");
        return null;
      }

      return orderDoc.data() as Order;
    } catch (err: any) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      setError(`Không thể lấy thông tin đơn hàng: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    notes?: string,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      // Nếu hủy đơn hàng, thêm lý do
      if (status === "cancelled" && notes) {
        updateData.cancellationReason = notes;
      }

      // Nếu trạng thái là shipping, cập nhật thời gian giao hàng
      if (status === "shipping") {
        updateData["shipping.shippedAt"] = Timestamp.now();
      }

      // Nếu trạng thái là completed, cập nhật thời gian hoàn thành
      if (status === "completed") {
        updateData["shipping.deliveredAt"] = Timestamp.now();
      }

      await updateDoc(orderRef, updateData);

      toast({
        title: "Cập nhật thành công",
        description: `Đơn hàng #${orderId} đã được cập nhật thành ${status}`,
        variant: "success",
      });

      return true;
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
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

  // Lấy thống kê đơn hàng
  const getOrderStats = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("Firestore chưa được khởi tạo");
      }

      const snapshot = await getDocs(collection(db, "orders"));
      const orders = snapshot.docs.map((doc) => doc.data() as Order);

      // Tính toán thống kê
      const stats = {
        total: orders.length,
        pending: orders.filter((order) => order.status === "pending").length,
        processing: orders.filter((order) => order.status === "processing")
          .length,
        shipping: orders.filter((order) => order.status === "shipping").length,
        completed: orders.filter((order) => order.status === "completed")
          .length,
        cancelled: orders.filter((order) => order.status === "cancelled")
          .length,
        recentOrders: orders.slice(0, 5),
        totalRevenue: orders
          .filter((order) => order.status !== "cancelled")
          .reduce((sum, order) => sum + order.total, 0),
      };

      return stats;
    } catch (err: any) {
      console.error("Lỗi khi lấy thống kê đơn hàng:", err);
      setError(`Không thể lấy thống kê đơn hàng: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats,
    loading,
    error,
  };
}
