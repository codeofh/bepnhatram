import React from "react";
import Head from "next/head";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Giới thiệu | BẾP NHÀ TRÂM</title>
        <meta name="description" content="Giới thiệu về BẾP NHÀ TRÂM - Nơi mang đến những món ăn ngon đậm đà hương vị Việt Nam" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Giới thiệu về Bếp Nhà Trâm</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Câu chuyện của chúng tôi</h2>
            <p className="text-gray-700 mb-4">
              Bếp Nhà Trâm ra đời từ niềm đam mê nấu nướng và mong muốn mang đến những món ăn Việt Nam thuần túy, được chế biến từ nguyên liệu tươi ngon nhất với công thức độc đáo gia truyền.
            </p>
            <p className="text-gray-700 mb-4">
              Chúng tôi tự hào mang đến cho thực khách những món ăn đậm đà hương vị quê nhà, từ những món ăn truyền thống đến các món đặc sản vùng miền, tất cả đều được chế biến tỉ mỉ và chu đáo.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Đặc trưng của Bếp Nhà Trâm</h2>
            <p className="text-gray-700 mb-4">
              - Nguyên liệu tươi sạch được tuyển chọn kỹ lưỡng mỗi ngày
            </p>
            <p className="text-gray-700 mb-4">
              - Món ăn được chế biến ngay khi có đơn đặt hàng
            </p>
            <p className="text-gray-700 mb-4">
              - Hương vị đậm đà, phù hợp với khẩu vị người Việt
            </p>
            <p className="text-gray-700 mb-4">
              - Đóng gói cẩn thận, giữ nguyên hương vị
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Cam kết của chúng tôi</h2>
            <p className="text-gray-700">
              Bếp Nhà Trâm cam kết mang đến những món ăn chất lượng nhất, được chế biến trong môi trường bếp sạch sẽ, đảm bảo vệ sinh an toàn thực phẩm. Chúng tôi luôn lắng nghe và cải thiện để mang đến trải nghiệm tốt nhất cho quý khách hàng.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
