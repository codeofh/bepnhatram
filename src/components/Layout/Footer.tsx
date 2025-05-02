
import React from "react";
import { Phone, MapPin, Clock, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white shadow-sm py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">Nhà hàng Việt Nam</h3>
            <p className="text-gray-600 text-sm">
              Chuyên phục vụ các món ăn truyền thống Việt Nam với hương vị đậm đà, nguyên liệu tươi ngon.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <div className="flex items-center text-gray-600">
              <Phone size={18} className="mr-2" />
              <span>0123 456 789</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail size={18} className="mr-2" />
              <span>info@nhahangvietnam.com</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4">Địa chỉ & Giờ mở cửa</h3>
            <div className="flex items-start text-gray-600">
              <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
              <span>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-2" />
              <span>10:00 - 22:00 (Thứ 2 - Chủ nhật)</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Nhà hàng Việt Nam. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
