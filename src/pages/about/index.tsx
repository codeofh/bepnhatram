import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { SiteSettings, getSiteSettings } from "@/lib/firebaseSettings";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteConfig);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Load settings from Firebase
  useEffect(() => {
    async function loadSettings() {
      try {
        const { settings: firebaseSettings } = await getSiteSettings();
        setSettings(firebaseSettings);
      } catch (err) {
        console.error("Error loading settings from Firebase:", err);
        // Fall back to default settings
        setSettings(defaultSiteConfig);
      } finally {
        setSettingsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Create a description with fallbacks for SEO
  const aboutDescription = `Giới thiệu về ${settings.name} - Nơi mang đến những món ăn ngon đậm đà hương vị Việt Nam tại Huế. Tìm hiểu về câu chuyện, giá trị và sứ mệnh của chúng tôi.`;

  return (
    <>
      <SEO
        title="Giới thiệu"
        description={aboutDescription}
        siteSettings={settings}
      />

      <Layout siteSettings={settings}>
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">
            Giới thiệu về {settings.name}
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">
              Câu chuyện của chúng tôi
            </h2>
            <p className="text-gray-700 mb-4">
              {settings.name} ra đời từ niềm đam mê nấu nướng và mong muốn
              mang đến những món ăn Việt Nam thuần túy, được chế biến từ nguyên
              liệu tươi ngon nhất với công thức độc đáo gia truyền.
            </p>
            <p className="text-gray-700 mb-4">
              Chúng tôi tự hào mang đến cho thực khách những món ăn đậm đà hương
              vị quê nhà, từ những món ăn truyền thống đến các món đặc sản vùng
              miền, tất cả đều được chế biến tỉ mỉ và chu đáo.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Đặc trưng của {settings.name}
            </h2>
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

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Cam kết của chúng tôi
            </h2>
            <p className="text-gray-700">
              {settings.name} cam kết mang đến những món ăn chất lượng nhất,
              được chế biến trong môi trường bếp sạch sẽ, đảm bảo vệ sinh an
              toàn thực phẩm. Chúng tôi luôn lắng nghe và cải thiện để mang đến
              trải nghiệm tốt nhất cho quý khách hàng.
            </p>
          </div>
        </main>
      </Layout>
    </>
  );
}
