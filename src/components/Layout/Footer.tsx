import React from "react";
import { Phone, MapPin, Clock, Mail, Facebook, ShoppingBag, UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-6 mt-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">BẾP NHÀ TRÂM</h3>
            <p className="text-gray-700 text-sm">
              Căn bếp nhỏ nhà Trâm cùng những món ăn ngon ❤️
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Liên hệ</h3>
            <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Phone size={18} className="mr-2 text-blue-500" />
              <span>0886286032</span>
            </div>
            <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Mail size={18} className="mr-2 text-blue-500" />
              <span>info@bepnhatram.com</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Facebook size={18} className="mr-2 text-blue-500" />
              <a href="https://fb.com/bepnhatram.1" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                fb.com/bepnhatram.1
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Đặt hàng</h3>
            <div className="flex items-center text-gray-700">
              <ShoppingBag size={18} className="mr-2 text-orange-500" />
              <a href="https://shopeefood.vn/hue/bep-nha-tram-ga-u-muoi-chan-ga" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                Shopee Food
              </a>
            </div>
            <div className="flex items-center text-gray-700">
              <UtensilsCrossed size={18} className="mr-2 text-green-500" />
              <a href="https://food.grab.com/vn/vi/restaurant/bep-nha-tram" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
                GrabFood
              </a>
            </div>
            <div className="flex items-center text-gray-700">
              <Facebook size={18} className="mr-2 text-blue-500" />
              <a href="https://fb.com/bepnhatram.1" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                Facebook
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Địa chỉ & Giờ mở cửa</h3>
            <div className="flex items-start text-gray-700 hover:text-blue-600 transition-colors">
              <MapPin size={18} className="mr-2 mt-1 flex-shrink-0 text-blue-500" />
              <span>15/15 Đống Đa, Phú Nhuận, Huế, Thành phố Huế</span>
            </div>
            <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Clock size={18} className="mr-2 text-blue-500" />
              <span>10:00 - 22:00 (Thứ 2 - Chủ nhật)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} BẾP NHÀ TRÂM. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}