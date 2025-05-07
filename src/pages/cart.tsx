import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/Cart/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { siteConfig } from "@/config/siteConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/router";

export default function CartPage() {
  const { items, itemCount, subtotal, clearCart } = useCartContext();
  const isEmpty = items.length === 0;
  const router = useRouter();

  // Format price with dot separator for thousands
  const formattedSubtotal = `${subtotal.toLocaleString("vi-VN")}₫`;

  // Ship fee based on subtotal
  const shipFee = subtotal > 200000 ? 0 : 30000;
  const formattedShipFee = `${shipFee.toLocaleString("vi-VN")}₫`;

  // Total
  const total = subtotal + shipFee;
  const formattedTotal = `${total.toLocaleString("vi-VN")}₫`;

  return (
    <Layout>
      <SEO title="Giỏ hàng" description="Giỏ hàng của bạn tại BẾP NHÀ TRÂM" />

      <div className="container py-8 px-4">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
          {!isEmpty && (
            <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">
              {itemCount} món
            </span>
          )}
        </div>

        {isEmpty ? (
          <Card className="border shadow-sm mb-8">
            <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <CardTitle className="text-lg mb-2">
                Giỏ hàng của bạn đang trống
              </CardTitle>
              <CardDescription className="text-center mb-6">
                Bạn chưa thêm bất kỳ món ăn nào vào giỏ hàng.
              </CardDescription>
              <Button onClick={() => router.push("/")}>
                Tiếp tục mua hàng
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: Cart items */}
            <div className="w-full md:w-2/3">
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="px-4 md:px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Chi tiết giỏ hàng</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="flex items-center gap-1 text-xs h-8"
                    >
                      <Trash2 size={14} />
                      <span>Xóa tất cả</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="px-4 md:px-6">
                      <CartItem item={item} showControls={true} />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="px-4 md:px-6 py-4 border-t flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <ArrowLeft size={16} />
                      <span>Tiếp tục mua hàng</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Right side: Order summary */}
            <div className="w-full md:w-1/3">
              <Card className="border shadow-sm sticky top-24">
                <CardHeader className="px-4 md:px-6 py-4 border-b">
                  <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span>{shipFee === 0 ? "Miễn phí" : formattedShipFee}</span>
                  </div>
                  {shipFee > 0 && (
                    <div className="text-xs text-gray-500 italic">
                      Miễn phí vận chuyển cho đơn hàng từ 200.000₫
                    </div>
                  )}
                  <div className="pt-4 border-t flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-500 text-lg">
                      {formattedTotal}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="px-4 md:px-6 py-4 flex flex-col gap-2">
                  <Button
                    className="w-full"
                    size="lg"
                    asChild
                    disabled={isEmpty}
                  >
                    <Link href="/checkout">Tiến hành thanh toán</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
