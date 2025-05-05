import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from "sonner";
import { MenuItem, SizeOption } from "@/data/menuItems";

// Định nghĩa kiểu dữ liệu cho một mục trong giỏ hàng
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  originalItem: MenuItem;
}

// Interface chứa các phương thức quản lý giỏ hàng
interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, selectedSize?: string) => void;
  removeItem: (itemId: string, selectedSize?: string) => void;
  updateQuantity: (itemId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  cartId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Keys cho localStorage
const CART_ITEMS_KEY = 'bnt_cart_items';
const CART_ID_KEY = 'bnt_cart_id';

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string>('');

  // Tổng số lượng sản phẩm trong giỏ hàng
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Tổng giá trị giỏ hàng
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Tạo cartId nếu chưa có và load giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        // Khôi phục cartId
        const storedCartId = localStorage.getItem(CART_ID_KEY);
        if (!storedCartId) {
          const newCartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem(CART_ID_KEY, newCartId);
          setCartId(newCartId);
        } else {
          setCartId(storedCartId);
        }

        // Khôi phục items
        const storedItems = localStorage.getItem(CART_ITEMS_KEY);
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadCartFromStorage();
    }
  }, []);

  // Lưu giỏ hàng vào localStorage khi items thay đổi
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && items.length > 0) {
        localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  // Thêm sản phẩm vào giỏ hàng
  const addItem = (item: MenuItem, quantity = 1, selectedSize?: string) => {
    setItems((prevItems) => {
      const sizeOption = selectedSize && item.sizes
        ? item.sizes.find(size => size.name === selectedSize)
        : undefined;

      const price = sizeOption ? sizeOption.price : item.price;
      const itemId = `${item.id}${selectedSize ? `-${selectedSize}` : ''}`;

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === itemId
      );

      if (existingItemIndex > -1) {
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };

        toast.success(`Đã cập nhật số lượng ${item.name}${selectedSize ? ` (${selectedSize})` : ''} trong giỏ hàng`);
        return updatedItems;
      } else {
        // Nếu sản phẩm chưa tồn tại, thêm mới
        const newItem: CartItem = {
          id: itemId,
          name: item.name,
          price,
          quantity,
          image: item.image,
          selectedSize,
          originalItem: item
        };

        toast.success(`Đã thêm ${item.name}${selectedSize ? ` (${selectedSize})` : ''} vào giỏ hàng`);
        return [...prevItems, newItem];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = (itemId: string, selectedSize?: string) => {
    const id = selectedSize ? `${itemId}-${selectedSize}` : itemId;

    setItems((prevItems) => {
      const updatedItems = prevItems.filter(item => item.id !== id);

      // Nếu giỏ hàng trống, xóa khỏi localStorage
      if (updatedItems.length === 0 && typeof window !== 'undefined') {
        localStorage.removeItem(CART_ITEMS_KEY);
      }

      return updatedItems;
    });

    toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (itemId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      // Nếu số lượng ≤ 0, xóa sản phẩm
      removeItem(itemId, selectedSize);
      return;
    }

    const id = selectedSize ? `${itemId}-${selectedSize}` : itemId;

    setItems((prevItems) =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_ITEMS_KEY);
    }
    toast("Giỏ hàng đã được xóa", {
      description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng"
    });
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      cartId
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook để sử dụng CartContext
export function useCartContext() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }

  return context;
}