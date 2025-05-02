import React from "react";
import { MapPin, Phone } from "lucide-react";

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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.2641274089488!2d107.59194319999999!3d16.462158199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a10027198345%3A0x96561dba360403e1!2zQuG6v3AgTmjDoCBUcsOibQ!5e0!3m2!1svi!2s!4v1746188965268!5m2!1svi!2s"              width="100%"
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
                  <p className="text-gray-600">15/15 Đống Đa, Phú Nhuận, Huế, Thành phố Huế</p>
                  <a
                    href="https://maps.app.goo.gl/oSWx2zEwL6VCU4Hf7"
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
                  <p className="text-gray-600">0886286032</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}