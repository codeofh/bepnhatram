import React from "react";
import { Phone, MapPin, Clock, Mail, Facebook, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function Footer() {
  return (
    <footer className="py-6 mt-8 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">{siteConfig.name}</h3>
            <p className="text-gray-700 text-sm">
              {siteConfig.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Liên hệ</h3>
            <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Phone size={18} className="mr-2 text-blue-500" />
              <span>{siteConfig.contact.phone}</span>
            </div>
            <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Mail size={18} className="mr-2 text-blue-500" />
              <span>{siteConfig.contact.email}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Facebook size={18} className="mr-2 text-blue-500" />
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                {siteConfig.social.facebookHandle}
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Đặt hàng</h3>
            <div className="flex items-center text-gray-700">
              <ShoppingBag size={18} className="mr-2 text-orange-500" />
              <a href={siteConfig.ordering.shopeeFood} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                Shopee Food
              </a>
            </div>
            <div className="flex items-center text-gray-700">
              <UtensilsCrossed size={18} className="mr-2 text-green-500" />
              <a href={siteConfig.ordering.grabFood} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
                GrabFood
              </a>
            </div>
            <div className="flex items-center text-gray-700">
              <Facebook size={18} className="mr-2 text-blue-500" />
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                Facebook
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Địa chỉ & Giờ mở cửa</h3>
            <div className="flex items-start text-gray-700 hover:text-blue-600 transition-colors">
              <MapPin size={18} className="mr-2 mt-1 flex-shrink-0 text-blue-500" />
              <span>{siteConfig.contact.address}</span>
            </div>
            <div className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Clock size={18} className="mr-2 text-blue-500" />
              <span>{siteConfig.contact.openingHours}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} {siteConfig.name}. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}