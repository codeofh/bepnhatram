import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { siteConfig } from "@/config/siteConfig";

export default function ContactPage() {
  return (
    <>
      <SEO 
        title="Liên hệ" 
        description={`Thông tin liên hệ ${siteConfig.name}. Địa chỉ: ${siteConfig.contact.address}. Điện thoại: ${siteConfig.contact.phone}. Email: ${siteConfig.contact.email}`}
      />

      <Layout>
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Liên hệ</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa chỉ email của bạn"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung tin nhắn"
                  ></textarea>
                </div>
                
                <Button type="submit" className="w-full">Gửi tin nhắn</Button>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Địa chỉ</h3>
                    <p className="text-gray-600">{siteConfig.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Điện thoại</h3>
                    <p className="text-gray-600">{siteConfig.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">{siteConfig.contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Giờ mở cửa</h3>
                    <p className="text-gray-600">{siteConfig.contact.openingHours}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={siteConfig.maps.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
