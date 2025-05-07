import React from "react";
import { MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function LocationMap() {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Vị trí cửa hàng</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 h-[280px] rounded-lg overflow-hidden shadow-md">
            <iframe
              src={siteConfig.maps.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí cửa hàng"
              aria-label="Bản đồ vị trí cửa hàng"
            ></iframe>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">Thông Tin Liên Hệ</h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Địa chỉ:</h4>
                  <p className="text-gray-600">{siteConfig.contact.address}</p>
                  <a
                    href={siteConfig.maps.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                  >
                    Chỉ đường
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Điện thoại:</h4>
                  <p className="text-gray-600">{siteConfig.contact.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
