import { CartItem } from "@/contexts/CartContext";
import { Timestamp } from "firebase/firestore";

// Các trạng thái có thể có của đơn hàng
export type OrderStatus =
  | 'pending'     // Đang chờ xác nhận
  | 'processing'  // Đang chuẩn bị
  | 'shipping'    // Đang giao hàng
  | 'completed'   // Đã hoàn thành
  | 'cancelled';  // Đã hủy

// Các phương thức thanh toán
export type PaymentMethod =
  | 'cod'           // Thanh toán khi nhận hàng
  | 'bank_transfer' // Chuyển khoản ngân hàng
  | 'momo'          // Ví điện tử MoMo
  | 'vnpay';        // VNPay

// Trạng thái thanh toán
export type PaymentStatus =
  | 'pending'    // Chưa thanh toán
  | 'completed'  // Đã thanh toán
  | 'failed';    // Thanh toán thất bại

// Interface cho thông tin khách hàng
export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  notes?: string;
}

// Interface cho thông tin thanh toán
export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Timestamp | null;
}

// Interface cho thông tin vận chuyển
export interface ShippingInfo {
  fee: number;
  estimatedDelivery?: Timestamp | null;
  shippedAt?: Timestamp | null;
  deliveredAt?: Timestamp | null;
}

// Interface cho đơn hàng
export interface Order {
  id: string;
  orderCode: string; // Mã đơn hàng dạng yyMMdd + 8 ký tự ngẫu nhiên
  userId: string | null; // Có thể là null nếu người dùng không đăng nhập
  items: CartItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  customer: CustomerInfo;
  payment: PaymentInfo;
  shipping: ShippingInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancellationReason?: string;
}

// Interface cho thống kê đơn hàng
export interface OrderStats {
  pending: number;
  processing: number;
  shipping: number;
  completed: number;
  cancelled: number;
  total: number;
}

// Thông tin để tạo đơn hàng mới
export interface CreateOrderData {
  items: CartItem[];
  subtotal: number;
  total: number;
  customer: CustomerInfo;
  payment: {
    method: PaymentMethod;
  };
  shipping: {
    fee: number;
  };
}