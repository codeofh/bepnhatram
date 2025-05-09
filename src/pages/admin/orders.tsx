import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Eye,
  Clock,
  ArrowUpDown,
  ChevronDown,
  Search,
  Filter,
  ShoppingCart,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/Admin/OrderStatusBadge";
import { OrderFilters } from "@/components/Admin/OrderFilters";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";
import { Order, OrderStatus } from "@/types/order";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { getAllOrders, loading: ordersLoading } = useAdminOrders();
  const [isClient, setIsClient] = useState(false);

  // State cho filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // State cho orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [isFiltering, setIsFiltering] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    } else if (user && !hasFetched) {
      fetchOrders();
    }
  }, [user, authLoading, router, hasFetched]);

  // Fetch orders with pagination
  const fetchOrders = async () => {
    setFetchError(null);
    try {
      const statusFilter =
        selectedStatus !== "all" ? (selectedStatus as OrderStatus) : undefined;

      const result = await getAllOrders(
        statusFilter,
        startDate,
        endDate,
        searchTerm,
        currentPage,
        itemsPerPage,
      );

      setOrders(result.items);
      setFilteredOrders(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setHasFetched(true);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setFetchError(
        error.message ||
          "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.",
      );
      setHasFetched(true);
    }
  };

  // Áp dụng bộ lọc và reset về trang 1
  const applyFilters = async () => {
    setIsFiltering(true);
    // Reset về trang 1 khi áp dụng bộ lọc mới
    setCurrentPage(1);
    try {
      // Luôn fetch lại từ server với filters và phân trang
      const statusFilter =
        selectedStatus !== "all" ? (selectedStatus as OrderStatus) : undefined;
      const result = await getAllOrders(
        statusFilter,
        startDate,
        endDate,
        searchTerm,
        1, // Trang 1
        itemsPerPage,
      );

      setFilteredOrders(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    // Reset về trang 1 khi xóa bộ lọc
    setCurrentPage(1);
    fetchOrders();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Re-fetch when page changes
  useEffect(() => {
    if (user && hasFetched) {
      fetchOrders();
    }
  }, [currentPage]);

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
        <title>Quản lý đơn hàng - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý đơn hàng" />
      </Head>

      <AdminLayout title="Quản lý đơn hàng">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Đơn hàng</CardTitle>
            <CardDescription>
              Qu��n lý tất cả đơn đặt hàng từ khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              applyFilters={applyFilters}
              resetFilters={resetFilters}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {ordersLoading || isFiltering ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12 space-y-3">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  Lỗi khi tải dữ liệu
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">{fetchError}</p>
                <Button onClick={() => fetchOrders()} className="mt-4">
                  Thử lại
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">
                  Không có đơn hàng nào
                </h3>
                <p className="text-gray-500">
                  {searchTerm ||
                  selectedStatus !== "all" ||
                  startDate ||
                  endDate
                    ? "Không tìm thấy đơn hàng phù hợp với bộ lọc"
                    : "Chưa có đơn hàng nào trong hệ thống"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="px-4 py-2 bg-gray-50 border-b">
                  <p className="text-sm text-gray-500">
                    {totalItems > 0 ? (
                      <>
                        Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                        {Math.min(currentPage * itemsPerPage, totalItems)} trên
                        tổng số {totalItems} đơn hàng
                      </>
                    ) : (
                      <>Không có đơn hàng nào</>
                    )}
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Mã đơn</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {order.orderCode || order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customer.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{formatDate(order.createdAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/order/${order.id}`)
                            }
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="p-4 border-t">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={
                              currentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {/* First page */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis for many pages */}
                        {currentPage > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Page before current */}
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(currentPage - 1)}
                            >
                              {currentPage - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Current page */}
                        <PaginationItem>
                          <PaginationLink
                            isActive
                            onClick={() => handlePageChange(currentPage)}
                          >
                            {currentPage}
                          </PaginationLink>
                        </PaginationItem>

                        {/* Page after current */}
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(currentPage + 1)}
                            >
                              {currentPage + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis for many pages */}
                        {currentPage < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Last page */}
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={
                              currentPage >= totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
