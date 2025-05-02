
import React from "react";
import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Bài viết | Nhà hàng Việt Nam</title>
        <meta name="description" content="Các bài viết về ẩm thực Việt Nam" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Bài viết</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Văn hóa ẩm thực Việt Nam</h2>
                <p className="text-gray-600 mb-4">Khám phá nét đặc trưng trong văn hóa ẩm thực Việt Nam qua các món ăn truyền thống.</p>
                <div className="text-blue-600 font-medium">Đọc thêm</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Bí quyết nấu phở ngon</h2>
                <p className="text-gray-600 mb-4">Những bí quyết để nấu một tô phở thơm ngon đúng điệu từ các đầu bếp chuyên nghiệp.</p>
                <div className="text-blue-600 font-medium">Đọc thêm</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Món ngon ba miền</h2>
                <p className="text-gray-600 mb-4">Tổng hợp các món ăn đặc sản nổi tiếng của ba miền Bắc - Trung - Nam.</p>
                <div className="text-blue-600 font-medium">Đọc thêm</div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
