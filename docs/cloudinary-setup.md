# Hướng dẫn cài đặt Cloudinary

Tài liệu này hướng dẫn cách cài đặt và cấu hình Cloudinary cho dự án Bếp Nhà Trâm.

## Đăng ký tài khoản Cloudinary

1. Truy cập [Cloudinary](https://cloudinary.com/) và đăng ký tài khoản miễn phí
2. Sau khi đăng nhập, bạn sẽ được chuyển đến Dashboard

## Lấy thông tin cấu hình

Từ Dashboard, bạn cần lấy các thông tin sau:

1. **Cloud Name**: Hiển thị trong phần "Account Details"
2. **API Key**: Hiển thị trong phần "Account Details"
3. **API Secret**: Hiển thị trong phần "Account Details" (lưu ý giữ bí mật)

## Tạo Upload Preset

Upload Preset là cấu hình cho phép tải lên không cần xác thực. Để tạo:

1. Từ Dashboard, chọn "Settings" (biểu tượng bánh răng) > "Upload"
2. Cuộn xuống phần "Upload presets"
3. Nhấp vào "Add upload preset"
4. Đặt tên preset là "bepnhatram" (hoặc tên bạn muốn)
5. Cấu hình các tùy chọn:
   - Signing Mode: Unsigned
   - Folder: bepnhatram (tùy chọn)
   - Overwrite: false
   - Unique filename: true
   - Delivery Type: upload
6. Nhấp "Save" để lưu preset

## Cập nhật biến môi trường

Sau khi có thông tin cấu hình, cập nhật các file `.env.development` và `.env.production`:

```
# Cloudinary configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=bepnhatram
```

Thay thế `your-cloud-name` và `your-api-key` bằng thông tin từ tài khoản Cloudinary của bạn.

## Kiểm tra cấu hình

1. Khởi động lại server: `npm run dev`
2. Truy cập trang quản trị > Thư viện Media
3. Tải lên một tệp và kiểm tra xem nó có xuất hiện trong thư viện không
4. Kiểm tra trong Dashboard Cloudinary để xác nhận tệp đã được tải lên

## Xử lý sự cố

### Lỗi "Invalid upload preset"

- Kiểm tra lại tên upload preset đã đúng chưa
- Đảm bảo preset được cấu hình là "Unsigned"

### Lỗi "Resource not found"

- Kiểm tra Cloud Name có chính xác không
- Đảm bảo API Key đúng

### Lỗi "File không tải lên được"

- Kiểm tra kết nối internet
- Kiểm tra kích thước tệp (giới hạn 10MB cho tài khoản miễn phí)
- Kiểm tra định dạng tệp (jpg, png, gif, webp, mp4 được hỗ trợ)

## Giới hạn tài khoản miễn phí

Tài khoản miễn phí của Cloudinary có một số giới hạn:
- 25GB lưu trữ
- 25GB băng thông mỗi tháng
- 500 lượt chuyển đổi mỗi tháng
- Kích thước tệp tối đa 10MB

Nếu cần nhiều hơn, bạn có thể nâng cấp lên gói trả phí.