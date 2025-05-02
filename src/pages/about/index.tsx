
import React from "react";
import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Giới thiệu | Nhà hàng Việt Nam</title>
        <meta name="description" content="Giới thiệu về Nhà hàng Việt Nam" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Giới thiệu</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Về Nhà hàng Việt Nam</h2>
            <p className="text-gray-700 mb-4">
              Nhà hàng Việt Nam được thành lập vào năm 2010, với mong muốn mang đến cho thực khách những trải nghiệm ẩm thực Việt Nam chính thống và đặc sắc nhất.
            </p>
            <p className="text-gray-700 mb-4">
              Chúng tôi tự hào về nguồn nguyên liệu tươi ngon, được tuyển chọn kỹ lưỡng từ các vùng miền trên cả nước, cùng với đội ngũ đầu bếp giàu kinh nghiệm và đam mê.
            </p>
            <p className="text-gray-700 mb-4">
              Mỗi món ăn tại Nhà hàng Việt Nam đều được chế biến công phu, giữ trọn hương vị truyền thống nhưng vẫn mang đến những nét sáng tạo độc đáo, đáp ứng khẩu vị của cả thực khách trong nước và quốc tế.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Sứ mệnh của chúng tôi</h2>
            <p className="text-gray-700 mb-4">
              Sứ mệnh của Nhà hàng Việt Nam là bảo tồn và phát huy nét đẹp văn hóa ẩm thực Việt, đồng thời mang những hương vị đặc trưng này đến gần hơn với bạn bè quốc tế.
            </p>
            <p className="text-gray-700">
              Chúng tôi cam kết mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời nhất, từ chất lượng món ăn đến không gian và dịch vụ.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
