import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle, Home, Package, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout/Layout';
import { SEO } from '@/components/SEO/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrders } from '@/hooks/useOrders';
import { useAuthContext } from '@/contexts/AuthContext';
import { Order } from '@/types/order';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user } = useAuthContext();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch thông tin đơn hàng
  useEffect(() => {
    async function fetchOrderDetails() {
      if (orderId && typeof orderId === 'string') {
        setLoading(true);
        try {
          const orderData = await getOrder(orderId);
          if (orderData) {
            setOrder(orderData);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, getOrder]);

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

  return (
    <Layout>
      <SEO
        title="Đặt hàng thành công"
        description="Cảm ơn bạn đã đặt hàng tại BẾP NHÀ TRÂM"
      />

      <div className="container py-8 px-4">
        <Card className="max-w-2xl mx-auto border shadow-sm">
          <CardHeader className="text-center pb-2">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Đặt hàng thành công!</CardTitle>
          </CardHeader>

          <CardContent className="pt-4 pb-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Cảm ơn bạn đã đặt hàng tại BẾP NHÀ TRÂM. Chúng tôi sẽ liên hệ với bạn
                trong thời gian sớm nhất để xác nhận đơn hàng.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : order ? (
              <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Mã đơn hàng:</h3>
                      <span className="font-bold">{order.orderCode || order.id}</span>
                    </div>
                  <div className="flex justify-between items-center mt-1">
                    <h3 className="font-medium">Ngày đặt hàng:</h3>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <h3 className="font-medium">Tổng tiền:</h3>
                    <span className="font-bold text-orange-500">
                      {order.total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  {order.payment.method === 'bank_transfer' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm">
                      <p className="font-medium mb-1">Vui lòng chuyển khoản theo thông tin:</p>
                      <p>Ngân hàng: <span className="font-medium">Vietcombank</span></p>
                      <p>Tên tài khoản: <span className="font-medium">NGUYEN THI TRAM</span></p>
                      <p>Số tài khoản: <span className="font-medium">1234567890</span></p>
                      <p className="mt-2 text-xs text-gray-600">
                        Nội dung chuyển khoản: BNT {order.id}
                      </p>
                    </div>
                  )}
                </div>

                  <div className="text-sm text-gray-600">
                    <h3 className="font-medium text-gray-900 mb-1">Giao đến:</h3>
                    <p>{order.customer.name} | {order.customer.phone}</p>
                    <p>{order.customer.address}</p>
                    {order.customer.email && (
                      <p className="text-gray-500 text-xs mt-1">Email: {order.customer.email}</p>
                    )}
                  </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Không tìm thấy thông tin đơn hàng
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center justify-center gap-2">
                  <Home size={16} />
                  <span>Trang chủ</span>
                </Link>
              </Button>

              {user ? (
                <Button asChild>
                  <Link href="/account/orders" className="flex items-center justify-center gap-2">
                    <span>Xem đơn hàng</span>
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/" className="flex items-center justify-center gap-2">
                    <Package size={16} />
                    <span>Tiếp tục mua hàng</span>
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}