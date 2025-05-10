import React from "react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { AdminBreadcrumb } from "@/components/Admin/AdminBreadcrumb";
import { AdminCardStats } from "@/components/Admin/AdminCardStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Calendar,
  DollarSign,
  Package,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <AdminBreadcrumb />

      <div className="grid gap-6">
        <h2 className="text-xl font-bold">Tổng quan</h2>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCardStats
            title="Tổng đơn hàng"
            value="24"
            description="Tuần này"
            icon={<ShoppingBag className="h-5 w-5 text-primary" />}
            trend={{ value: 12, isPositive: true }}
          />

          <AdminCardStats
            title="Doanh thu"
            value="2.450.000₫"
            description="Tháng này"
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            trend={{ value: 5.2, isPositive: true }}
          />

          <AdminCardStats
            title="Khách hàng"
            value="142"
            description="Tổng số"
            icon={<Users className="h-5 w-5 text-primary" />}
          />

          <AdminCardStats
            title="Món ăn"
            value="36"
            description="Đang hoạt động"
            icon={<Package className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                  <CardDescription>
                    Danh sách các đơn hàng mới nhất
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin/orders">Xem tất cả</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 grid grid-cols-5 text-sm font-medium">
                  <div className="col-span-2">Khách hàng</div>
                  <div>Thời gian</div>
                  <div>Tổng tiền</div>
                  <div>Trạng thái</div>
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-4 grid grid-cols-5 text-sm items-center"
                    >
                      <div className="col-span-2 font-medium">Nguyễn Văn A</div>
                      <div className="text-gray-500">Hôm nay, 14:30</div>
                      <div className="font-medium">120.000₫</div>
                      <div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Hoàn thành
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Các thao tác thường xuyên</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/admin/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Quản lý đơn hàng
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/admin/menu">
                    <Package className="mr-2 h-4 w-4" />
                    Quản lý thực đơn
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/admin/sliders">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Cài đặt slider
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </a>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/admin/settings">
                    <Calendar className="mr-2 h-4 w-4" />
                    Cài đặt thông tin
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
