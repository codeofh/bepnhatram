import React from "react";
import { MapPin, Clock, Phone } from "lucide-react";

export function LocationMap() {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Vị Trí Nhà Hàng</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nhà hàng Việt Nam tọa lạc tại trung tâm thành phố, dễ dàng tiếp cận từ nhiều hướng và gần các địa điểm du lịch nổi tiếng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197574!2d106.69393413433356!3d10.778827289360934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702d07%3A0xa5777fb3a5bb9e35!2sL%C3%AA%20L%E1%BB%A3i%2C%20B%E1%BA%BFn%20Ngh%C3%A9%2C%20Qu%E1%BA%ADn%201%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1682456132246!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí Nhà hàng Việt Nam"
              aria-label="Bản đồ vị trí Nhà hàng Việt Nam"
            ></iframe>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-6">Thông Tin Liên Hệ</h3>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Địa chỉ:</h4>
                  <p className="text-gray-600">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                  <a 
                    href="https://goo.gl/maps/RN7BX5GD8ZNJS1ht9" 
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
                  <p className="text-gray-600">0123 456 789</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Giờ mở cửa:</h4>
                  <p className="text-gray-600">Thứ 2 - Thứ 6: 10:00 - 22:00</p>
                  <p className="text-gray-600">Thứ 7 - Chủ nhật: 09:00 - 23:00</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-medium mb-2">Phương tiện di chuyển:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                <li>Xe buýt: Các tuyến 01, 14, 45 (dừng cách 50m)</li>
                <li>Taxi/Grab: Có điểm đón trả khách trước nhà hàng</li>
                <li>Xe máy/Ô tô: Có bãi đỗ xe rộng rãi phía sau nhà hàng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}