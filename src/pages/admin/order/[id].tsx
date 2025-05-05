import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  Check,
  X,
  Package,
  Truck,
  Mail,
  Phone,
  MapPin,
  AlertTriangle
} from "lucide-react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/Admin/OrderStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";
import { Order, OrderStatus } from "@/types/order";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuthContext();
  const { getOrderById, updateOrderStatus, loading: orderLoading } = useAdminOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/admin");
    } else if (user && id && typeof id === 'string' && !hasFetched) {
      fetchOrder(id);
    }
  }, [user, authLoading, router, id, hasFetched]);

  // Fetch order details
  const fetchOrder = async (orderId: string) => {
    setFetchError(null);
    try {
      const orderData = await getOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
        // Set default new status based on current status
        setDefaultNewStatus(orderData.status);
      } else {
        router.push("/admin/orders");
      }
      setHasFetched(true);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      setFetchError(error.message || "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      setHasFetched(true);
    }
  };

  // Set default new status based on current status
  const setDefaultNewStatus = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case 'pending':
        setNewStatus('processing');
        break;
      case 'processing':
        setNewStatus('shipping');
        break;
      case 'shipping':
        setNewStatus('completed');
        break;
      default:
        setNewStatus('');
    }
  };

  // Handle order status update
  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;

    setIsSubmitting(true);
    try {
      const success = await updateOrderStatus(
        order.id,
        newStatus as OrderStatus,
        newStatus === 'cancelled' ? statusNotes : undefined
      );

      if (success) {
        setStatusUpdateOpen(false);
        // Refresh order data
        if (id && typeof id === 'string') {
          fetchOrder(id);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  // Payment method mapping
  const paymentMethodMap: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng',
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    vnpay: 'VNPay'
  };

  // Next available statuses based on current status
  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipping', 'cancelled'];
      case 'shipping':
        return ['completed', 'cancelled'];
      case 'completed':
        return [];
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  if (authLoading || !isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {order ? `Chi tiết đơn hàng #${order.orderCode || order.id}` : 'Đơn hàng'} - {siteConfig.name} Admin
        </title>
        <meta name="description" content="Chi tiết đơn hàng" />
      </Head>

      <AdminLayout title={order ? `Chi tiết đơn hàng #${order.orderCode || order.id}` : 'Đơn hàng'}>
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/admin/orders" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span>Quay lại danh sách</span>
            </Link>
          </Button>
        </div>

        {orderLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : fetchError ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 space-y-3">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                <h3 className="text-lg font-medium">Lỗi khi tải thông tin đơn hàng</h3>
                <p className="text-gray-500 max-w-md mx-auto">{fetchError}</p>
                <Button onClick={() => id && typeof id === 'string' && fetchOrder(id)} className="mt-4">
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !order ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-500 mt-2">Đơn hàng không tồn tại hoặc đã bị xóa</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Header with order info and status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Đơn hàng #{order.orderCode || order.id}</CardTitle>
                    <CardDescription>
                      Đặt hàng lúc: {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <OrderStatusBadge status={order.status} className="px-3 py-1" />

                    {/* Status update button */}
                    {getNextStatuses(order.status).length > 0 && (
                      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Cập nhật trạng thái</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
                            <DialogDescription>
                              Thay đổi trạng thái đơn hàng #{order.orderCode || order.id}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <label htmlFor="status" className="text-sm font-medium">
                                Trạng thái mới
                              </label>
                              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn trạng thái mới" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getNextStatuses(order.status).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      <div className="flex items-center gap-2">
                                        <OrderStatusBadge status={status} showIcon={false} />
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {newStatus === 'cancelled' && (
                              <div className="grid gap-2">
                                <label htmlFor="notes" className="text-sm font-medium">
                                  Lý do hủy đơn
                                </label>
                                <Textarea
                                  id="notes"
                                  placeholder="Nhập lý do hủy đơn hàng"
                                  value={statusNotes}
                                  onChange={(e) => setStatusNotes(e.target.value)}
                                />
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
                              Hủy
                            </Button>
                            <Button
                              onClick={handleUpdateStatus}
                              disabled={isSubmitting || !newStatus || (newStatus === 'cancelled' && !statusNotes)}
                              variant={newStatus === 'cancelled' ? 'destructive' : 'default'}
                            >
                              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Order Status */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Mã đơn hàng</h3>
                    <p className="text-sm">{order.orderCode || order.id}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">ID hệ thống</h3>
                    <p className="text-sm text-gray-500">{order.id}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Tình trạng thanh toán</h3>
                    <p className="text-sm">
                      {order.payment.status === 'completed' ? (
                        <span className="text-green-600 font-medium">Đã thanh toán</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Chưa thanh toán</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Phương thức thanh toán</h3>
                    <p className="text-sm">{paymentMethodMap[order.payment.method] || order.payment.method}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Order details */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Chi tiết đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                          <TableHead className="text-center">SL</TableHead>
                          <TableHead className="text-right">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.name}
                              {item.selectedSize && (
                                <span className="text-xs text-gray-500 block">
                                  ({item.selectedSize})
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-6">
                    <div></div>
                    <div className="space-y-2 text-right">
                      <div className="flex justify-end gap-8">
                        <span className="text-gray-500">Tạm tính:</span>
                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-end gap-8">
                        <span className="text-gray-500">Phí vận chuyển:</span>
                        <span className="font-medium">
                          {order.shipping.fee === 0 ? 'Miễn phí' : formatCurrency(order.shipping.fee)}
                        </span>
                      </div>
                      <div className="flex justify-end gap-8 border-t pt-2">
                        <span className="font-medium">Tổng cộng:</span>
                        <span className="font-bold text-xl text-orange-600">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Customer info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Thông tin khách hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Khách hàng</h3>
                      <p className="font-medium">{order.customer.name}</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <Phone className="h-3.5 w-3.5" />
                        <span>Số điện thoại</span>
                      </h3>
                      <p>
                        <a href={`tel:${order.customer.phone}`} className="text-blue-600 hover:underline">
                          {order.customer.phone}
                        </a>
                      </p>
                    </div>

                    {order.customer.email && (
                      <div className="space-y-1">
                        <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email</span>
                        </h3>
                        <p>
                          <a href={`mailto:${order.customer.email}`} className="text-blue-600 hover:underline">
                            {order.customer.email}
                          </a>
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Địa chỉ giao hàng</span>
                      </h3>
                      <p>{order.customer.address}</p>
                    </div>

                    {order.customer.notes && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Ghi chú</h3>
                        <p className="text-sm italic">{order.customer.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping info & timeline */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Thông tin vận chuyển</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Phí vận chuyển</h3>
                      <p>{order.shipping.fee === 0 ? 'Miễn phí' : formatCurrency(order.shipping.fee)}</p>
                    </div>

                    {order.shipping.shippedAt && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Thời gian gửi hàng</h3>
                        <p>{formatDate(order.shipping.shippedAt)}</p>
                      </div>
                    )}

                    {order.shipping.deliveredAt && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Thời gian giao hàng</h3>
                        <p>{formatDate(order.shipping.deliveredAt)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cancellation reason */}
            {order.status === 'cancelled' && order.cancellationReason && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Đơn hàng đã bị hủy</AlertTitle>
                <AlertDescription>
                  Lý do: {order.cancellationReason}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </AdminLayout>
    </>
  );
}