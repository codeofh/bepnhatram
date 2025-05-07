import React from "react";
import { CartItem, useCartContext } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  showItems?: boolean;
}

export function OrderSummary({ showItems = true }: OrderSummaryProps) {
  const { items, subtotal } = useCartContext();

  // Tính phí vận chuyển dựa trên giá trị đơn hàng
  const shippingFee = subtotal > 200000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "₫";
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="px-4 md:px-6 py-4 border-b">
        <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {showItems && items.length > 0 && (
          <ScrollArea className="max-h-[250px]">
            <div className="px-4 md:px-6 py-3">
              <h3 className="font-medium text-sm mb-2">
                Món ăn ({items.length})
              </h3>
              <div className="space-y-3">
                {items.map((item: CartItem) => (
                  <OrderItem
                    key={item.id}
                    name={item.name}
                    quantity={item.quantity}
                    price={item.price}
                    size={item.selectedSize}
                  />
                ))}
              </div>
            </div>
            <Separator />
          </ScrollArea>
        )}

        <div className="p-4 md:p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tạm tính:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phí vận chuyển:</span>
            <span>
              {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
            </span>
          </div>

          {shippingFee > 0 && (
            <div className="text-xs text-gray-500 italic">
              Miễn phí vận chuyển cho đơn hàng từ 200.000₫
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between font-medium">
            <span>Tổng cộng:</span>
            <span className="text-orange-500 font-bold text-lg">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OrderItemProps {
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

function OrderItem({ name, quantity, price, size }: OrderItemProps) {
  return (
    <div className="flex justify-between items-start text-sm">
      <div>
        <span className="font-medium">
          {name} {size && <span className="text-gray-500">({size})</span>}
        </span>
        <div className="text-gray-500 text-xs">x{quantity}</div>
      </div>
      <span className="font-medium">
        {(price * quantity).toLocaleString("vi-VN")}₫
      </span>
    </div>
  );
}
