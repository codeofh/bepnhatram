import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartContext, CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  showControls?: boolean;
}

export function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartContext();

  // Format price with dot separator for thousands
  const formattedPrice = `${item.price.toLocaleString("vi-VN")}₫`;
  const totalPrice = `${(item.price * item.quantity).toLocaleString("vi-VN")}₫`;

  const handleIncrease = () => {
    updateQuantity(item.id.split('-')[0], item.quantity + 1, item.selectedSize);
  };

  const handleDecrease = () => {
    updateQuantity(item.id.split('-')[0], item.quantity - 1, item.selectedSize);
  };

  const handleRemove = () => {
    removeItem(item.id.split('-')[0], item.selectedSize);
  };

  return (
    <div className="flex py-3 border-b last:border-0">
      <div className="h-16 w-16 relative rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
          <button 
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Xóa khỏi giỏ hàng"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {item.selectedSize && (
          <p className="text-xs text-gray-500">Kích cỡ: {item.selectedSize}</p>
        )}

        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-orange-500 font-medium">{formattedPrice}</span>
          
          {showControls ? (
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={handleDecrease}
                aria-label="Giảm số lượng"
              >
                <Minus size={14} />
              </Button>
              <span className="mx-2 text-sm min-w-[20px] text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={handleIncrease}
                aria-label="Tăng số lượng"
              >
                <Plus size={14} />
              </Button>
            </div>
          ) : (
            <span className="text-sm text-gray-600">x{item.quantity}</span>
          )}
        </div>
      </div>
    </div>
  );
}