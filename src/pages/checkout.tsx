import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { CheckoutForm } from "@/components/Checkout/CheckoutForm";
import { OrderSummary } from "@/components/Checkout/OrderSummary";
import { useCartContext } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/Auth/AuthDialog";

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartContext();
  const { user, loading } = useAuthContext();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  // Kiểm tra nếu giỏ hàng trống thì chuyển về trang giỏ hàng
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router, loading]);

  // Gợi ý đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!loading && !user) {
      setAuthDialogOpen(true);
    }
  }, [user, loading]);

  // Nếu đang tải thì hiển thị màn hình loading
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Thanh toán"
        description="Hoàn tất đơn hàng của bạn - BẾP NHÀ TRÂM"
      />

      <div className="container py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              <span>Quay lại giỏ hàng</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold mt-4">Thanh toán</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Left column - Checkout form */}
          <div className="w-full lg:w-2/3 space-y-6">
            <CheckoutForm />
          </div>

          {/* Right column - Order summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <OrderSummary showItems={true} />

              <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Lưu ý: Đơn hàng sẽ được xác nhận qua điện thoại trong vòng 30
                  phút sau khi đặt hàng thành công.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gợi ý đăng nhập */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </Layout>
  );
}
