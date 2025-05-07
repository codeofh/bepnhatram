import React from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/components/Cart/CartItem";
import { useCartContext } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDropdown() {
  const { items, itemCount, subtotal, clearCart } = useCartContext();
  const formattedSubtotal = `${subtotal.toLocaleString("vi-VN")}₫`;

  const isEmpty = items.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-orange-500 text-white">
              {itemCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={5}>
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h3 className="font-medium">Giỏ hàng của bạn</h3>
            {!isEmpty && (
              <Badge variant="outline" className="ml-1">
                {itemCount} món
              </Badge>
            )}
          </div>
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="h-auto p-1 text-gray-500 hover:text-red-500"
              aria-label="Xóa tất cả"
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {isEmpty ? (
          <div className="py-10 px-4 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">
              Giỏ hàng trống
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hãy thêm món ăn vào giỏ hàng của bạn
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px] p-3">
              {items.map((item) => (
                <CartItem key={item.id} item={item} showControls={false} />
              ))}
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex justify-between mb-3">
                <span className="font-medium">Tạm tính:</span>
                <span className="font-bold text-orange-500">
                  {formattedSubtotal}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/cart" passHref legacyBehavior>
                  <Button variant="outline" className="w-full" asChild>
                    <a>Xem giỏ hàng</a>
                  </Button>
                </Link>
                <Link href="/checkout" passHref legacyBehavior>
                  <Button className="w-full" asChild>
                    <a>Thanh toán</a>
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
