import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PaymentMethods } from '@/components/Checkout/PaymentMethods';
import { useCartContext } from '@/contexts/CartContext';
import { useOrders } from '@/hooks/useOrders';
import { CreateOrderData, PaymentMethod } from '@/types/order';
import { useAuthContext } from '@/contexts/AuthContext';

// Schema xác thực form đặt hàng
const checkoutFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên phải có ít nhất 2 ký tự',
  }),
  email: z.string().email({
    message: 'Email không hợp lệ',
  }).optional(),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  }),
  address: z.string().min(5, {
    message: 'Địa chỉ phải có ít nhất 5 ký tự',
  }),
  city: z.string().default("Huế"),
  district: z.string().default(""),
  ward: z.string().default(""),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'momo', 'vnpay'] as const),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartContext();
  const { user } = useAuthContext();
  const { createOrder, loading } = useOrders();

  // Khởi tạo form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: 'Huế',
      district: '',
      ward: '',
      notes: '',
      paymentMethod: 'cod',
    },
  });

  // Tính phí vận chuyển dựa trên giá trị đơn hàng
  const shippingFee = subtotal > 200000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // Xử lý khi submit form
  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      return;
    }

    try {
      // Tạo dữ liệu đơn hàng
      const orderData: CreateOrderData = {
        items: items,
        subtotal,
        total,
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          district: values.district,
          ward: values.ward,
          notes: values.notes,
        },
        payment: {
          method: values.paymentMethod as PaymentMethod,
        },
        shipping: {
          fee: shippingFee,
        }
      };

      // Gọi API tạo đơn hàng
      const orderId = await createOrder(orderData);

      if (orderId) {
        // Xóa giỏ hàng sau khi đặt hàng thành công
        clearCart();

        // Chuyển hướng đến trang đặt hàng thành công
        // Sử dụng router.push kết hợp với timeout để đảm bảo navigation hoạt động đúng
        try {
          setTimeout(() => {
            router.push({
              pathname: '/order-success',
              query: { orderId }
            });
          }, 100);
        } catch (navError) {
          console.error("Lỗi khi chuyển hướng:", navError);
          // Fallback nếu chuyển hướng thất bại
          window.location.href = `/order-success?orderId=${orderId}`;
        }
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Họ tên người nhận" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Số điện thoại liên hệ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Email (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email của bạn" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nhập email nếu bạn muốn nhận thông báo về đơn hàng
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Vui lòng nhập địa chỉ đầy đủ để thuận tiện cho việc giao hàng
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Các trường địa lý chi tiết tạm thời ẩn */}
            <input type="hidden" {...form.register("city")} />
            <input type="hidden" {...form.register("district")} />
            <input type="hidden" {...form.register("ward")} />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thông tin bổ sung về đơn hàng"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ví dụ: lưu ý về món ăn, thời gian giao hàng...
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PaymentMethods
                    selectedMethod={field.value as PaymentMethod}
                    onSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Đặt hàng'
          )}
        </Button>
      </form>
    </Form>
  );
}