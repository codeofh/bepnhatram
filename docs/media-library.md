# Hướng dẫn sử dụng Thư viện Media

Thư viện Media trong dự án Bếp Nhà Trâm cho phép bạn quản lý tất cả các tệp đa phương tiện (hình ảnh, video) được sử dụng trong trang web. Thư viện hỗ trợ hai phương thức lưu trữ: cục bộ và Cloudinary.

## Truy cập Thư viện Media

1. Đăng nhập vào trang quản trị
2. Từ menu chính, chọn "Thư viện Media"

## Tải lên tệp

### Tải lên từ thiết bị

1. Nhấp vào nút "Tải lên" ở góc trên bên phải
2. Chọn tệp từ thiết bị của bạn
3. Tệp sẽ được tải lên và hiển thị trong thư viện

### Kéo và thả

1. Kéo tệp từ máy tính của bạn
2. Thả vào khu vực thư viện
3. Tệp sẽ được tải lên tự động

## Quản lý tệp

### Xem thông tin tệp

1. Nhấp vào tệp để xem thông tin chi tiết
2. Thông tin hiển thị bao gồm:
   - Tên tệp
   - Kích thước
   - Kích thước (pixel) nếu là hình ảnh
   - Ngày tạo
   - Nguồn (cục bộ hoặc Cloudinary)

### Xóa tệp

1. Chọn tệp bạn muốn xóa
2. Nhấp vào biểu tượng thùng rác
3. Xác nhận xóa

### Chọn nhiều tệp

1. Nhấn và giữ phím Shift hoặc Ctrl (Command trên Mac)
2. Nhấp vào các tệp bạn muốn chọn
3. Thực hiện các thao tác hàng loạt như xóa nhiều tệp cùng lúc

## Tìm kiếm và lọc

1. Sử dụng thanh tìm kiếm để tìm tệp theo tên
2. Sử dụng bộ lọc để hiển thị tệp theo loại (hình ảnh, video)
3. Sắp xếp tệp theo tên, ngày tạo, kích thước

## Sử dụng tệp trong nội dung

1. Trong trình soạn thảo nội dung, nhấp vào biểu tượng "Chèn hình ảnh"
2. Chọn tệp từ thư viện media
3. Tệp sẽ được chèn vào nội dung

## Lưu trữ Cloudinary

Khi tệp được tải lên, nó sẽ được lưu trữ cả cục bộ và trên Cloudinary. Điều này mang lại những lợi ích sau:

### Ưu điểm của Cloudinary

1. **Tối ưu hóa tự động**: Hình ảnh được tối ưu hóa để tải nhanh hơn
2. **Phân phối qua CDN**: Nội dung được phân phối qua mạng lưới CDN toàn cầu
3. **Biến đổi hình ảnh**: Dễ dàng thay đổi kích thước, cắt và áp dụng hiệu ứng
4. **Dự phòng**: Nếu máy chủ cục bộ gặp sự cố, nội dung vẫn có sẵn từ Cloudinary

### Cấu hình Cloudinary

Để sử dụng Cloudinary, bạn cần cập nhật các biến môi trường trong file `.env.development` và `.env.production`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Xử lý lỗi

### Tệp không tải lên được

1. Kiểm tra kết nối internet
2. Đảm bảo tệp không vượt quá kích thước tối đa (10MB)
3. Kiểm tra định dạng tệp (chỉ hỗ trợ jpg, jpeg, png, gif, webp, mp4)

### Tệp không hiển thị sau khi tải lên

1. Làm mới trang
2. Kiểm tra quyền truy cập thư mục uploads
3. Kiểm tra cấu hình Cloudinary

## Câu hỏi thường gặp

### Tôi có thể xóa tệp khỏi Cloudinary không?

Khi bạn xóa tệp từ thư viện media, tệp sẽ bị xóa khỏi cơ sở dữ liệu cục bộ và không còn hiển thị trong thư viện. Tuy nhiên, tệp vẫn tồn tại trên Cloudinary. Để xóa hoàn toàn khỏi Cloudinary, bạn cần truy cập bảng điều khiển Cloudinary.

### Tôi có thể tải lên tệp trực tiếp lên Cloudinary không?

Có, bạn có thể tải lên tệp trực tiếp lên Cloudinary thông qua thư viện media. Khi bạn tải lên tệp, nó sẽ được lưu trữ cả cục bộ và trên Cloudinary.

### Làm thế nào để sử dụng tệp từ Cloudinary trong nội dung?

Khi bạn chèn hình ảnh từ thư viện media, hệ thống sẽ tự động sử dụng URL Cloudinary nếu có sẵn. Điều này giúp tận dụng các tính năng tối ưu hóa của Cloudinary.