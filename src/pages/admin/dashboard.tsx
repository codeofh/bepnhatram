import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ShoppingCart,
  Users,
  UtensilsCrossed,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { siteConfig } from "@/config/siteConfig";
import { menuItems } from "@/data/menuItems";

export default function AdminDashboardPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

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

  // Demo stats
  const stats = [
    {
      title: "Tổng doanh thu",
      value: "15,200,000đ",
      description: "Tháng này",
      change: "+15%",
      trend: "up",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Đơn hàng mới",
      value: "48",
      description: "Trong tuần",
      change: "+8%",
      trend: "up",
      icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Người dùng mới",
      value: "12",
      description: "Trong tháng",
      change: "-3%",
      trend: "down",
      icon: <Users className="h-5 w-5 text-purple-500" />,
    },
    {
      title: "Món ăn",
      value: menuItems.length.toString(),
      description: "Trên thực đơn",
      change: "+2",
      trend: "up",
      icon: <UtensilsCrossed className="h-5 w-5 text-amber-500" />,
    },
  ];

  const popularItems = menuItems
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <>
      <Head>
        <title>Dashboard - {siteConfig.name} Admin</title>
        <meta name="description" content="Trang quản trị tổng quan" />
      </Head>

      <AdminLayout title="Dashboard">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-gray-100 rounded-full">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="text-xs font-medium">
                    {stat.description}
                  </span>
                  <span className={`ml-2 flex items-center text-xs font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}>
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 ml-0.5" />
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Món ăn phổ biến</CardTitle>
              <CardDescription>
                Top 5 món ăn được đánh giá cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularItems.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="w-12 h-12 rounded-md overflow-hidden mr-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-gray-500">
                        {item.price.toLocaleString()}đ
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <div className={`flex items-center ${item.rating >= 4 ? "text-green-500" : "text-amber-500"
                        }`}>
                        {item.rating >= 4 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        <span className="font-medium">{item.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 ml-1">/ 5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê danh mục</CardTitle>
              <CardDescription>
                Số lượng món ăn theo danh mục
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Đặc biệt", id: "special", color: "bg-purple-500" },
                  { name: "Món chính", id: "main", color: "bg-orange-500" },
                  { name: "Gà ủ muối", id: "chicken", color: "bg-amber-500" },
                  { name: "Chân gà", id: "chicken-feet", color: "bg-red-500" },
                  { name: "Đồ uống", id: "drinks", color: "bg-blue-500" },
                ].map((category) => {
                  const count = menuItems.filter(
                    (item) => item.category === category.id
                  ).length;
                  const percentage = Math.round(
                    (count / menuItems.length) * 100
                  );

                  return (
                    <div key={category.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} món ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${category.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}