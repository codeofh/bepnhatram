# Hướng dẫn chạy dự án BẾP NHÀ TRÂM

## Cài đặt

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

## Chạy dự án

### Môi trường phát triển

```bash
npm run dev
# hoặc
yarn dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

### Môi trường production

```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

## Tạo tài nguyên

Để tạo hình ảnh OG và favicon:

```bash
npm run generate-assets
# hoặc
yarn generate-assets
```

## Cấu trúc dự án

- `src/pages`: Chứa các trang của ứng dụng
- `src/components`: Chứa các component React
- `src/context`: Chứa các React Context
- `src/hooks`: Chứa các custom React hooks
- `src/lib`: Chứa các thư viện và tiện ích
- `public`: Chứa các tài nguyên tĩnh

## Tính năng chính

1. **Trang chủ**: Hiển thị danh sách món ăn theo danh mục
2. **Tìm kiếm**: Tìm kiếm món ăn (hỗ trợ tìm kiếm không dấu)
3. **Giới thiệu**: Thông tin về nhà hàng
4. **Liên hệ**: Thông tin liên hệ

## Lưu ý

- Dự án sử dụng Next.js và TypeScript
- Giao diện được xây dựng bằng Tailwind CSS và Radix UI
- Đã tối ưu hóa SEO với meta tags và structured data
- Hỗ trợ PWA với site.webmanifest