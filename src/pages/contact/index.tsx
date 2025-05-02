
import React from "react";
import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Liên hệ | Nhà hàng Việt Nam</title>
        <meta name="description" content="Thông tin liên hệ Nhà hàng Việt Nam" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
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
                    <p className="text-gray-600">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Điện thoại</h3>
                    <p className="text-gray-600">0123 456 789</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">info@nhahangvietnam.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={24} className="text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Giờ mở cửa</h3>
                    <p className="text-gray-600">10:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 h-64 bg-gray-200 rounded-lg">
                {/* Map placeholder - would be replaced with actual map */}
                <div className="h-full flex items-center justify-center text-gray-500">
                  Bản đồ
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
