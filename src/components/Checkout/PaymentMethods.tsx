import React from 'react';
import { CreditCard, Banknote, Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PaymentMethod } from '@/types/order';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethods({ selectedMethod, onSelect }: PaymentMethodsProps) {
  return (
    <RadioGroup
      value={selectedMethod}
      onValueChange={(value) => onSelect(value as PaymentMethod)}
      className="space-y-3"
    >
      <div className="flex items-start space-x-2 bg-white p-3 border rounded-md">
        <RadioGroupItem value="cod" id="cod" className="mt-1" />
        <div className="grid gap-1.5 leading-none w-full">
          <div className="flex justify-between w-full">
            <Label htmlFor="cod" className="font-medium">Thanh toán khi nhận hàng (COD)</Label>
            <Banknote className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-500">
            Thanh toán bằng tiền mặt khi đơn hàng được giao đến
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-2 bg-white p-3 border rounded-md">
        <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
        <div className="grid gap-1.5 leading-none w-full">
          <div className="flex justify-between w-full">
            <Label htmlFor="bank_transfer" className="font-medium">Chuyển khoản ngân hàng</Label>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500">
            Chuyển khoản đến số tài khoản của chúng tôi
          </p>
          {selectedMethod === 'bank_transfer' && (
            <div className="mt-2 p-3 bg-gray-50 text-sm rounded-md">
              <p className="font-medium mb-1">Thông tin tài khoản:</p>
              <p>Ngân hàng: <span className="font-medium">Vietcombank</span></p>
              <p>Tên tài khoản: <span className="font-medium">NGUYEN THI TRAM</span></p>
              <p>Số tài khoản: <span className="font-medium">1234567890</span></p>
              <p className="mt-2 text-xs text-gray-500">
                Nội dung chuyển khoản: BNT + Số điện thoại
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start space-x-2 bg-white p-3 border rounded-md opacity-50">
        <RadioGroupItem value="momo" id="momo" className="mt-1" disabled />
        <div className="grid gap-1.5 leading-none w-full">
          <div className="flex justify-between w-full">
            <Label htmlFor="momo" className="font-medium">Ví điện tử MoMo</Label>
            <Wallet className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-sm text-gray-500">
            Đang cập nhật...
          </p>
        </div>
      </div>
    </RadioGroup>
  );
}