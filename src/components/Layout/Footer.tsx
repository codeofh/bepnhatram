import React from "react";
import { Phone, MapPin, Clock, Mail, Facebook, ShoppingBag, UtensilsCrossed, MessageCircle } from "lucide-react";
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
            <div className="flex items-center text-gray-700">
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px] mr-2 text-black fill-current"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">
                {siteConfig.social.tiktokHandle}
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
              <MessageCircle size={18} className="mr-2 text-blue-600" />
              <a href={siteConfig.social.messenger} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                Messenger
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