import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  Clock,
  Package,
  Truck,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout/Layout";
import { useOrders } from "@/hooks/useOrders";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";
import { Order, OrderStatus } from "@/types/order";

export default function AccountOrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuthContext();
  const { getOrder, loading: orderLoading } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/");
    } else if (user && id && typeof id === "string" && !hasFetched) {
      fetchOrder(id);
    }
  }, [user, authLoading, router, id, hasFetched]);

  // Fetch order details
  const fetchOrder = async (orderId: string) => {
    setFetchError(null);
    try {
      const orderData = await getOrder(orderId);
      if (orderData) {
        setOrder(orderData);
      } else {
        router.push("/account/orders");
      }
      setHasFetched(true);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      setFetchError(
        error.message ||
          "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.",
      );
      setHasFetched(true);
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "₫";
  };

  // Payment method mapping
  const paymentMethodMap: Record<string, string> = {
    cod: "Thanh toán khi nhận hàng",
    bank_transfer: "Chuyển khoản ngân hàng",
    momo: "Ví MoMo",
    vnpay: "VNPay",
  };

  // Order status mapping
  const orderStatusMap: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Chờ xác nhận" },
    processing: { color: "bg-blue-100 text-blue-800", label: "Đang chuẩn bị" },
    shipping: { color: "bg-purple-100 text-purple-800", label: "Đang giao" },
    completed: { color: "bg-green-100 text-green-800", label: "Đã hoàn thành" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Đã hủy" },
  };

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user || !user.displayName) return "?";

    const nameParts = user.displayName.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
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
    <Layout>
      <Head>
        <title>
          {order
            ? `Đơn hàng #${order.orderCode || order.id}`
            : "Chi tiết đơn hàng"}{" "}
          - {siteConfig.name}
        </title>
        <meta name="description" content="Chi tiết đơn hàng của bạn" />
      </Head>

      <div className="container py-8 px-4 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Account navigation sidebar */}
          <aside className="w-full md:w-64">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-medium">
                    {getUserInitials()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {user.displayName || "Người dùng"}
                    </CardTitle>
                    <CardDescription className="text-sm truncate">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <Link
                    href="/account"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="mr-3 h-4 w-4">👤</span>
                    <span className="text-sm font-medium">
                      Thông tin tài khoản
                    </span>
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center px-4 py-2 bg-gray-100"
                  >
                    <ShoppingBag className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">
                      Đơn hàng của tôi
                    </span>
                  </Link>
                  <Link
                    href="/account/settings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="mr-3 h-4 w-4">⚙️</span>
                    <span className="text-sm font-medium">
                      Cài đặt tài khoản
                    </span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main content area */}
          <div className="flex-1">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Quay lại danh sách đơn hàng</span>
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
                    <h3 className="text-lg font-medium">
                      Lỗi khi tải thông tin đơn hàng
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {fetchError}
                    </p>
                    <Button
                      onClick={() =>
                        id && typeof id === "string" && fetchOrder(id)
                      }
                      className="mt-4"
                    >
                      Thử lại
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : !order ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">
                      Không tìm thấy đơn hàng
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Đơn hàng không tồn tại hoặc đã bị xóa
                    </p>
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
                        <CardTitle className="text-xl">
                          Đơn hàng #{order.orderCode || order.id}
                        </CardTitle>
                        <CardDescription>
                          Đặt hàng lúc: {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge
                        className={
                          orderStatusMap[order.status].color + " px-3 py-1"
                        }
                      >
                        {orderStatusMap[order.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Order Status */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          Mã đơn hàng
                        </h3>
                        <p className="text-sm">{order.orderCode || order.id}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          Tình trạng thanh toán
                        </h3>
                        <p className="text-sm">
                          {order.payment.status === "completed" ? (
                            <span className="text-green-600 font-medium">
                              Đã thanh toán
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-medium">
                              Chưa thanh toán
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">
                          Phương thức thanh toán
                        </h3>
                        <p className="text-sm">
                          {paymentMethodMap[order.payment.method] ||
                            order.payment.method}
                        </p>
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
                              <TableHead className="text-right">
                                Đơn giá
                              </TableHead>
                              <TableHead className="text-center">SL</TableHead>
                              <TableHead className="text-right">
                                Thành tiền
                              </TableHead>
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
                                <TableCell className="text-center">
                                  {item.quantity}
                                </TableCell>
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
                            <span className="font-medium">
                              {formatCurrency(order.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-end gap-8">
                            <span className="text-gray-500">
                              Phí vận chuyển:
                            </span>
                            <span className="font-medium">
                              {order.shipping.fee === 0
                                ? "Miễn phí"
                                : formatCurrency(order.shipping.fee)}
                            </span>
                          </div>
                          <div className="flex justify-end gap-8 border-t pt-2">
                            <span className="font-medium">Tổng cộng:</span>
                            <span className="font-bold text-xl text-orange-600">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Customer info */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Thông tin giao hàng</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-gray-500">
                            Người nhận
                          </h3>
                          <p className="font-medium">{order.customer.name}</p>
                        </div>

                        <div className="space-y-1">
                          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                            <Phone className="h-3.5 w-3.5" />
                            <span>Số điện thoại</span>
                          </h3>
                          <p>{order.customer.phone}</p>
                        </div>

                        {order.customer.email && (
                          <div className="space-y-1">
                            <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                              <Mail className="h-3.5 w-3.5" />
                              <span>Email</span>
                            </h3>
                            <p>{order.customer.email}</p>
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
                            <h3 className="text-sm font-medium text-gray-500">
                              Ghi chú
                            </h3>
                            <p className="text-sm italic">
                              {order.customer.notes}
                            </p>
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
                          <h3 className="text-sm font-medium text-gray-500">
                            Phí vận chuyển
                          </h3>
                          <p>
                            {order.shipping.fee === 0
                              ? "Miễn phí"
                              : formatCurrency(order.shipping.fee)}
                          </p>
                        </div>

                        {order.shipping.shippedAt && (
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium text-gray-500">
                              Thời gian gửi hàng
                            </h3>
                            <p>{formatDate(order.shipping.shippedAt)}</p>
                          </div>
                        )}

                        {order.shipping.deliveredAt && (
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium text-gray-500">
                              Thời gian giao hàng
                            </h3>
                            <p>{formatDate(order.shipping.deliveredAt)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Bank transfer info if applicable */}
                    {order.payment.method === "bank_transfer" &&
                      order.payment.status !== "completed" && (
                        <Card className="border-blue-200 bg-blue-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-blue-800">
                              Thông tin chuyển khoản
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <p className="font-medium mb-1">
                              Vui lòng chuyển khoản theo thông tin:
                            </p>
                            <p>
                              Ngân hàng:{" "}
                              <span className="font-medium">Vietcombank</span>
                            </p>
                            <p>
                              Tên tài khoản:{" "}
                              <span className="font-medium">
                                NGUYEN THI TRAM
                              </span>
                            </p>
                            <p>
                              Số tài khoản:{" "}
                              <span className="font-medium">1234567890</span>
                            </p>
                            <p className="mt-2 text-xs text-gray-600">
                              Nội dung chuyển khoản: BNT {order.id}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </div>

                {/* Cancellation reason */}
                {order.status === "cancelled" && order.cancellationReason && (
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
