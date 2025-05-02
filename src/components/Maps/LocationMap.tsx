import React from "react";
import { MapPin, Clock, Phone } from "lucide-react";

export function LocationMap() {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Vị Trí Nhà Hàng</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nhà hàng Việt Nam tọa lạc tại trung tâm thành phố, dễ dàng tiếp cận từ nhiều hướng và gần các địa điểm du lịch nổi tiếng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 h-[280px] rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4946681095273!2d106.69916237579378!3d10.771450089387599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3f3129e64d%3A0x8d6b2d79522c7f30!2zMTIzIMSQxrDhu51uZyBMw6ogTOG7o2ksIELhur9uIE5naMOpLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1sen!2sus!4v1684651472083!5m2!1sen!2sus"
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

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">Thông Tin Liên Hệ</h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Địa chỉ:</h4>
                  <p className="text-gray-600">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                  <a
                    href="https://goo.gl/maps/CZxNRcrjXXn2PJnt7"
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

            <div className="mt-5">
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