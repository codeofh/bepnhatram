import React from "react";
import { Phone, MapPin, Clock, Mail, Facebook, ShoppingBag, UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white shadow-sm py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">BẾP NHÀ TRÂM</h3>
            <p className="text-gray-600 text-sm">
            Căn bếp nhỏ nhà Trâm cùng những món ăn ngon &lt;3
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <div className="flex items-center text-gray-600">
              <Phone size={18} className="mr-2" />
              <span>0886286032</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail size={18} className="mr-2" />
              <span>info@bepnhatram.com</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Facebook size={18} className="mr-2" />
              <a href="https://fb.com/bepnhatram.1" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                fb.com/bepnhatram.1
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">Đặt hàng</h3>
            <div className="flex items-center text-gray-600">
              <ShoppingBag size={18} className="mr-2" />
              <a href="https://shopeefood.vn/hue/bep-nha-tram-ga-u-muoi-chan-ga" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">
                Shopee
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <UtensilsCrossed size={18} className="mr-2" />
              <a href="https://food.grab.com/vn/vi/restaurant/bep-nha-tram" target="_blank" rel="noopener noreferrer" className="hover:text-green-600">
                GrabFood
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <Facebook size={18} className="mr-2" />
              <a href="https://fb.com/bepnhatram.1" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                Facebook
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">Địa chỉ & Giờ mở cửa</h3>
            <div className="flex items-start text-gray-600">
              <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
              <span>15/15 Đống Đa, Phú Nhuận, Huế, Thành phố Huế</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-2" />
              <span>10:00 - 22:00 (Thứ 2 - Chủ nhật)</span>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} BẾP NHÀ TRÂM. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}