# BẾP NHÀ TRÂM - Website

Trang web cho nhà hàng BẾP NHÀ TRÂM, chuyên các món ăn ngon tại Huế.

## Tính năng

- Hiển thị danh sách món ăn theo danh mục
- Tìm kiếm món ăn (hỗ trợ tìm kiếm không dấu)
- Hiển thị thông tin về nhà hàng
- Hiển thị thông tin liên hệ
- Giao diện thân thiện với thiết bị di động
- Tối ưu hóa SEO
- Thư viện media với tích hợp Cloudinary

## Công nghệ sử dụng

- Next.js
- React
- Tailwind CSS
- Radix UI
- React Hook Form
- TypeScript
- Firebase (Authentication, Firestore)
- Cloudinary (Quản lý media)

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. Clone repository:

   ```bash
   git clone https://github.com/codeofh/bepnhatram.git
   cd bepnhatram
   ```

2. Cài đặt các dependencies:

   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. Chạy ứng dụng ở môi trường phát triển:

   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

4. Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

### Tạo bản build cho môi trường production

```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

### Tạo tài nguyên

Để tạo hình ảnh OG và favicon:

```bash
npm run generate-assets
# hoặc
yarn generate-assets
```

## Cấu trúc thư mục

```
bepnhatram/
├── public/              # Tài nguyên tĩnh
├── scripts/             # Scripts tiện ích
├── src/                 # Mã nguồn
│   ├── components/      # Các component React
│   ├── context/         # React Context
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Thư viện và tiện ích
│   ├── pages/           # Các trang của ứng dụng
│   ├── styles/          # CSS và Tailwind
│   └── types/           # TypeScript types
├── .eslintrc.json      # Cấu hình ESLint
├── .gitignore          # Danh sách file bỏ qua cho Git
├── next.config.js      # Cấu hình Next.js
├── package.json        # Dependencies và scripts
├── postcss.config.js   # Cấu hình PostCSS
├── tailwind.config.js  # Cấu hình Tailwind CSS
└── tsconfig.json       # Cấu hình TypeScript
```

## Tính năng đã cải thiện

- Tìm kiếm sản phẩm (hỗ trợ tìm kiếm không dấu)
- Hiển thị 2 sản phẩm trên mỗi hàng cho màn hình di động
- Cải thiện giao diện người dùng trên thiết bị di động
- Thêm thông báo toast khi thêm vào giỏ hàng
- Tối ưu hóa SEO với meta tags và structured data
- Thêm sitemap.xml và robots.txt
- Hỗ trợ PWA với site.webmanifest
- Tích hợp Cloudinary cho thư viện media
- Hỗ trợ lưu trữ tệp cả cục bộ và trên Cloudinary

## Thư viện Media

Thư viện media hỗ trợ hai phương thức lưu trữ:

### 1. Lưu trữ cục bộ

Các tệp được tải lên sẽ được lưu trữ trong thư mục `public/uploads/library`. Phương thức này phù hợp cho việc phát triển và kiểm thử.

### 2. Lưu trữ trên Cloudinary

Các tệp cũng được tải lên Cloudinary để lưu trữ trực tuyến. Điều này giúp:
- Tối ưu hóa hình ảnh tự động
- Phân phối nội dung qua CDN
- Quản lý tài nguyên dễ dàng

#### Cấu hình Cloudinary

1. Đăng ký tài khoản tại [Cloudinary](https://cloudinary.com/)
2. Lấy thông tin Cloud name, API Key và tạo Upload preset
3. Cập nhật các biến môi trường trong file `.env.development` và `.env.production`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Liên hệ

- Email: info@bepnhatram.com
- Facebook: [fb.com/bepnhatram.1](https://fb.com/bepnhatram.1)
- Địa chỉ: 15/15 Đống Đa, Phú Nhuận, Huế, Thành phố Huế
