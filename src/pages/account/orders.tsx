import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  User, 
  ShoppingBag, 
  Settings, 
  ChevronDown, 
  Clock, 
  Search,
  X,
  PackageOpen,
  ShoppingCart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout/Layout";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";

// Sample order data for display purposes
const sampleOrders = [
  {
    id: "ORD-123456",
    date: "2023-07-15",
    total: 350000,
    status: "completed",
    items: [
      {
        id: "1",
        name: "Gà ủ muối hoa tiêu 1/4 con",
        quantity: 1,
        price: 95000
      },
      {
        id: "6",
        name: "Mì Ý sốt thịt băm",
        quantity: 2,
        price: 85000
      },
      {
        id: "12",
        name: "Nước me đá",
        quantity: 1,
        price: 35000
      }
    ]
  },
  {
    id: "ORD-123457",
    date: "2023-08-22",
    total: 165000,
    status: "completed",
    items: [
      {
        id: "2",
        name: "Cá hồi áp chảo",
        quantity: 1,
        price: 165000
      }
    ]
  }
];

// Order status mapping
const orderStatusMap: Record<string, { color: string, label: string }> = {
  "pending": { color: "bg-yellow-100 text-yellow-800", label: "Chờ xác nhận" },
  "processing": { color: "bg-blue-100 text-blue-800", label: "Đang chuẩn bị" },
  "shipping": { color: "bg-purple-100 text-purple-800", label: "Đang giao" },
  "completed": { color: "bg-green-100 text-green-800", label: "Đã hoàn thành" },
  "cancelled": { color: "bg-red-100 text-red-800", label: "Đã hủy" }
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  // Handle client-side hydration and fetch orders
  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push('/');
    } else {
      // In a real app, fetch orders from Firebase
      // For now, use sample data
      setOrders(sampleOrders);
    }
  }, [user, loading, router]);

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user || !user.displayName) return '?';
    
    const nameParts = user.displayName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  // Format date in Vietnamese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format price with dot separator for thousands
  const formatPrice = (price: number) => {
    return `${price.toLocaleString("vi-VN")}₫`;
  };

  // Filter orders by status and search query
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  if (loading || !isClient) {
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
        <title>Đơn hàng của tôi - {siteConfig.name}</title>
        <meta name="description" content="Lịch sử đơn hàng và theo dõi trạng thái" />
      </Head>

      <div className="container py-8 px-4 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Account navigation sidebar */}
          <aside className="w-full md:w-64">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-green-600 text-white">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.displayName || 'Người dùng'}</CardTitle>
                    <CardDescription className="text-sm truncate">{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <Link href="/account" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <User className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Thông tin tài khoản</span>
                  </Link>
                  <Link href="/account/orders" className="flex items-center px-4 py-2 bg-gray-100">
                    <ShoppingBag className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Đơn hàng của tôi</span>
                  </Link>
                  <Link href="/account/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Cài đặt tài khoản</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main content area */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng của tôi</CardTitle>
                <CardDescription>
                  Xem lịch sử đơn hàng và theo dõi trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm đơn hàng theo mã hoặc món..."
                      className="pl-10 pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="processing">Đang chuẩn bị</SelectItem>
                      <SelectItem value="shipping">Đang giao</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders list */}
                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Collapsible
                        key={order.id}
                        open={expandedOrders.includes(order.id)}
                        onOpenChange={() => toggleOrderExpansion(order.id)}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="p-4 bg-gray-50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{order.id}</h3>
                                <Badge className={orderStatusMap[order.status].color}>
                                  {orderStatusMap[order.status].label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(order.date)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{formatPrice(order.total)}</span>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                                    expandedOrders.includes(order.id) ? 'rotate-180' : ''
                                  }`} />
                                  <span className="sr-only">Chi tiết</span>
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="p-4 border-t">
                            <h4 className="font-medium mb-3">Chi tiết đơn hàng</h4>
                            <div className="space-y-3">
                              {order.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                      <PackageOpen className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{item.name}</p>
                                      <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Tổng cộng</span>
                                <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">Chưa có đơn hàng nào</h3>
                    {searchQuery ? (
                      <p className="text-gray-500">Không tìm thấy đơn hàng nào phù hợp với tìm kiếm của bạn</p>
                    ) : (
                      <p className="text-gray-500">Bạn chưa có đơn hàng nào trong lịch sử</p>
                    )}
                    <Button className="mt-3" asChild>
                      <Link href="/">Khám phá thực đơn</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}