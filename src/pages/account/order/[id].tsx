import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Clock, CheckCircle2, Package, Truck, XCircle, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout/Layout';
import { SEO } from '@/components/SEO/SEO';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { useAuthContext } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types/order';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuthContext();
  const { getOrder, updateOrderStatus, loading: orderLoading } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch thông tin đơn hàng
  useEffect(() => {
    async function fetchOrderDetails() {
      if (id && typeof id === 'string') {
        setLoading(true);
        try {
          const orderData = await getOrder(id);
          if (orderData) {
            setOrder(orderData);
          } else {
            // Nếu không tìm thấy đơn hàng hoặc không có quyền xem
            router.push('/account/orders');
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (id && !authLoading && user) {
      fetchOrderDetails();
    } else if (!authLoading && !user) {
      router.push('/');
    }
  }, [id, user, authLoading, getOrder, router]);

  // Format thời gian từ timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      return;
    }
    
    const reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (reason === null) return; // User clicked Cancel on prompt
    
    const success = await updateOrderStatus(order.id, 'cancelled', reason);
    if (success) {
      // Reload order data
      const updatedOrder = await getOrder(order.id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    }
  };

  // Status configuration
  const orderStatusConfig: Record<OrderStatus, { label: string, color: string, icon: React.ReactNode }> = {
    pending: { 
      label: 'Chờ xác nhận', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: <Clock className="h-4 w-4" /> 
    },
    processing: { 
      label: 'Đang chuẩn bị', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: <Package className="h-4 w-4" /> 
    },
    shipping: { 
      label: 'Đang giao', 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      icon: <Truck className="h-4 w-4" /> 
    },
    completed: { 
      label: 'Đã hoàn thành', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: <CheckCircle2 className="h-4 w-4" /> 
    },
    cancelled: { 
      label: 'Đã hủy', 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: <XCircle className="h-4 w-4" /> 
    }
  };

  // Payment method mapping
  const paymentMethodMap: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng',
    bank_transfer: 'Chuyển khoản ngân h��ng',
    momo: 'Ví MoMo',
    vnpay: 'VNPay'
  };

  // Nếu đang tải thì hiển thị màn hình loading
  if (loading || authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-8 px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Không tìm thấy đơn hàng</AlertTitle>
            <AlertDescription>
              Không thể tìm thấy thông tin đơn hàng hoặc bạn không có quyền xem đơn hàng này.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link href="/account/orders">Quay lại danh sách đơn hàng</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const status = orderStatusConfig[order.status] || orderStatusConfig.pending;

  return (
    <Layout>
      <SEO
        title={`Đơn hàng #${order.id}`}
        description="Chi tiết đơn hàng của bạn tại BẾP NHÀ TRÂM"
      />
      
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
              <Link href="/account/orders" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ChevronLeft size={16} />
                <span>Quay lại danh sách đơn hàng</span>
              </Link>
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
              <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
              <Badge 
                className={`${status.color} mt-2 sm:mt-0 flex items-center gap-1 px-3 py-1 border`}
                variant="outline"
              >
                {status.icon}
                <span>{status.label}</span>
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Order Details */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Chi tiết đơn hàng</CardTitle>
                <CardDescription>
                  Đặt hàng lúc: {formatDate(order.createdAt)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
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
                          {item.price.toLocaleString('vi-VN')}₫
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính:</span>
                    <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển:</span>
                    <span>
                      {order.shipping.fee === 0 
                        ? 'Miễn phí' 
                        : `${order.shipping.fee.toLocaleString('vi-VN')}₫`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-500">
                      {order.total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
                
                {order.status === 'pending' && (
                  <div className="mt-6">
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelOrder}
                      disabled={orderLoading}
                    >
                      Hủy đơn hàng
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Customer & Delivery Info */}
            <div className="space-y-6">
              {/* Payment Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phương thức:</span>
                    <span className="font-medium">
                      {paymentMethodMap[order.payment.method] || order.payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái:</span>
                    <Badge variant={order.payment.status === 'completed' ? 'success' : 'outline'}>
                      {order.payment.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Badge>
                  </div>
                  
                  {order.payment.method === 'bank_transfer' && order.payment.status !== 'completed' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md text-xs">
                      <p className="font-medium mb-1">Thông tin chuyển khoản:</p>
                      <p>Ngân hàng: <span className="font-medium">Vietcombank</span></p>
                      <p>Tên tài khoản: <span className="font-medium">NGUYEN THI TRAM</span></p>
                      <p>Số tài khoản: <span className="font-medium">1234567890</span></p>
                      <p className="mt-2 text-xs text-gray-600">
                        Nội dung chuyển khoản: BNT {order.id}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Họ tên:</span>
                    <span className="ml-2 font-medium">{order.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="ml-2">{order.customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2">{order.customer.email}</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Shipping Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thông tin giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Địa chỉ:</span>
                    <div className="mt-1">
                      {order.customer.address}, {order.customer.ward},
                      <br />{order.customer.district}, {order.customer.city}
                    </div>
                  </div>
                  
                  {order.customer.notes && (
                    <div className="mt-2">
                      <span className="text-gray-500">Ghi chú:</span>
                      <div className="mt-1 italic">{order.customer.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Order Status Timeline - Can be implemented in future updates */}
            </div>
          </div>
          
          {order.status === 'cancelled' && order.cancellationReason && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Đơn hàng đã bị hủy</AlertTitle>
              <AlertDescription>
                Lý do: {order.cancellationReason}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between">
            <Button asChild>
              <Link href="/account/orders">Quay lại danh sách đơn hàng</Link>
            </Button>
            
            {order.status !== 'cancelled' && (
              <Button variant="outline" asChild>
                <Link href="/">
                  <span className="flex items-center gap-2">
                    Tiếp tục mua hàng <ExternalLink size={16} />
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}