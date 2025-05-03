/**
 * Cấu hình tập trung cho trang web BẾP NHÀ TRÂM
 * Tất cả thông tin liên hệ, URL, và cài đặt khác được lưu trữ ở đây
 * Các giá trị có thể được ghi đè bằng biến môi trường
 */

export const siteConfig = {
  // Thông tin cơ bản
  name: process.env.NEXT_PUBLIC_SITE_NAME || "BẾP NHÀ TRÂM",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Căn bếp nhỏ nhà Trâm cùng những món ăn ngon ❤️",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://bepnhatram.com",
  
  // Thông tin liên hệ
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "0886286032",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@bepnhatram.com",
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "15/15 Đống Đa, Phú Nhuận, Huế, Thành phố Huế",
    openingHours: process.env.NEXT_PUBLIC_OPENING_HOURS || "10:00 - 22:00 (Thứ 2 - Chủ nhật)",
    city: process.env.NEXT_PUBLIC_CONTACT_CITY || "Huế",
    region: process.env.NEXT_PUBLIC_CONTACT_REGION || "Thừa Thiên Huế",
    postalCode: process.env.NEXT_PUBLIC_CONTACT_POSTAL_CODE || "530000",
    countryCode: process.env.NEXT_PUBLIC_CONTACT_COUNTRY_CODE || "VN",
  },
  
  // Mạng xã hội
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://fb.com/bepnhatram.1",
    facebookHandle: process.env.NEXT_PUBLIC_FACEBOOK_HANDLE || "fb.com/bepnhatram.1",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "",
  },
  
  // Đặt hàng
  ordering: {
    shopeeFood: process.env.NEXT_PUBLIC_SHOPEEFOOD_URL || "https://shopeefood.vn/hue/bep-nha-tram-ga-u-muoi-chan-ga",
    grabFood: process.env.NEXT_PUBLIC_GRABFOOD_URL || "https://food.grab.com/vn/vi/restaurant/bep-nha-tram",
  },
  
  // Bản đồ
  maps: {
    embedUrl: process.env.NEXT_PUBLIC_MAPS_EMBED_URL || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.2641274089488!2d107.59194319999999!3d16.462158199999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a10027198345%3A0x96561dba360403e1!2zQuG6v3AgTmjDoCBUcsOibQ!5e0!3m2!1svi!2s!4v1746188965268!5m2!1svi!2s",
    directionsUrl: process.env.NEXT_PUBLIC_MAPS_DIRECTIONS_URL || "https://maps.app.goo.gl/oSWx2zEwL6VCU4Hf7",
    latitude: process.env.NEXT_PUBLIC_MAPS_LATITUDE || "16.462158199999998",
    longitude: process.env.NEXT_PUBLIC_MAPS_LONGITUDE || "107.59194319999999",
  },
  
  // SEO
  seo: {
    titleTemplate: process.env.NEXT_PUBLIC_SEO_TITLE_TEMPLATE || "%s - BẾP NHÀ TRÂM",
    defaultTitle: process.env.NEXT_PUBLIC_SEO_DEFAULT_TITLE || "BẾP NHÀ TRÂM - Món ăn ngon tại Huế",
    defaultDescription: process.env.NEXT_PUBLIC_SEO_DEFAULT_DESCRIPTION || 
      "BẾP NHÀ TRÂM - Nhà hàng chuyên các món gà ủ muối, chân gà rút xương và các món ăn đặc sản tại Huế",
    ogImageUrl: process.env.NEXT_PUBLIC_SEO_OG_IMAGE_URL || "/og-image.jpg",
    twitterHandle: process.env.NEXT_PUBLIC_SEO_TWITTER_HANDLE || "@bepnhatram",
    keywords: process.env.NEXT_PUBLIC_SEO_KEYWORDS || "bếp nhà trâm, nhà hàng huế, gà ủ muối, chân gà rút xương, đặc sản huế, ẩm thực huế",
    homePageTitle: process.env.NEXT_PUBLIC_SEO_HOME_PAGE_TITLE || "Trang chủ",
  },
  
  // Cài đặt khác
  settings: {
    currency: process.env.NEXT_PUBLIC_CURRENCY || "VND",
    currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₫",
    locale: process.env.NEXT_PUBLIC_LOCALE || "vi-VN",
  }
};