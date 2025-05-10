# Hướng dẫn sử dụng Thư viện Phương tiện

Thư viện phương tiện trong dự án cho phép bạn quản lý tất cả các tệp đa phương tiện (hình ảnh, video) được sử dụng trong trang web. Thư viện hỗ trợ hai phương thức lưu trữ: cục bộ và Cloudinary.

## 1. Truy cập Thư viện Phương tiện

1. Đăng nhập vào trang quản trị
2. Từ menu bên trái, chọn "Thư viện phương tiện"

## 2. Tải lên tệp

### Tải lên từ thiết bị

1. Nhấp vào nút "Tải lên" ở góc trên bên phải
2. Chọn tệp từ thiết bị của bạn
3. Tệp sẽ được tải lên và hiển thị trong thư viện

### Kéo và thả

1. Kéo tệp từ máy tính của bạn
2. Thả vào khu vực thư viện
3. Tệp sẽ được tải lên tự động

### Tải lên qua Cloudinary

1. Nhấp vào nút "Cloudinary"
2. Chọn tệp từ thiết bị của bạn
3. Tệp sẽ được tải lên Cloudinary và hiển thị trong thư viện

## 3. Quản lý tệp

### Xem thông tin tệp

1. Nhấp vào tệp để xem thông tin chi tiết
2. Thông tin hiển thị bao gồm:
   - Tên tệp
   - URL
   - Loại (hình ảnh hoặc video)
   - Nguồn (cục bộ hoặc Cloudinary)
   - Kích thước tệp
   - Kích thước (pixel) nếu là hình ảnh
   - Ngày tạo
   - Thẻ

### Sao chép URL

1. Nhấp vào tệp để xem chi tiết
2. Nhấp vào nút "Sao chép URL"
3. URL sẽ được sao chép vào clipboard của bạn

### Quản lý thẻ

1. Nhấp vào tệp để xem chi tiết
2. Thêm thẻ mới bằng cách nhập vào ô "Thêm thẻ..." và nhấn Enter
3. Xóa thẻ bằng cách nhấp vào biểu tượng X bên cạnh thẻ

### Xóa tệp

1. Chọn tệp bạn muốn xóa
2. Nhấp vào biểu tượng thùng rác trong hộp thoại chi tiết
3. Xác nhận xóa

### Chọn nhiều tệp

1. Nhấp vào hộp kiểm trong góc của mỗi tệp
2. Thực hiện các thao tác hàng loạt như xóa nhiều tệp cùng lúc

## 4. Tìm kiếm và lọc

### Tìm kiếm

1. Sử dụng thanh tìm kiếm ở góc trên bên trái
2. Nhập tên tệp hoặc thẻ để tìm kiếm

### Lọc theo loại

1. Sử dụng các tab để lọc tệp:
   - "Tất cả": Hiển thị tất cả tệp
   - "Hình ảnh": Chỉ hiển thị hình ảnh
   - "Video": Chỉ hiển thị video
   - "Tệp cục bộ": Chỉ hiển thị tệp lưu trữ cục bộ
   - "Cloudinary": Chỉ hiển thị tệp lưu trữ trên Cloudinary

### Sắp xếp

1. Sử dụng menu thả xuống "Sắp xếp theo" để sắp xếp tệp theo:
   - "Mới nhất": Tệp mới nhất lên đầu
   - "Cũ nhất": Tệp cũ nhất lên đầu
   - "Tên tệp": Sắp xếp theo tên tệp theo thứ tự ABC

## 5. Sử dụng tệp trong nội dung

### Chèn phương tiện vào nội dung

1. Trong trình soạn thảo nội dung, nhấp vào biểu tượng "Chèn hình ảnh/video"
2. Sử dụng MediaSelector để chọn phương tiện từ thư viện
3. Phương tiện sẽ được chèn vào nội dung

### Sử dụng MediaSelector

```tsx
import { MediaSelector } from "@/components/Admin/MediaSelector";
import { MediaItem } from "@/lib/mediaLibrary";

// Trong component của bạn
const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

// Trong JSX
<MediaSelector
  onSelect={(media) => setSelectedMedia(media)}
  selectedMedia={selectedMedia}
  allowedTypes={["image"]} // hoặc ["video"] hoặc ["image", "video"]
  buttonText="Chọn hình ảnh"
/>;
```

## 6. Lưu trữ Cloudinary

### Ưu điểm của Cloudinary

1. **Tối ưu hóa tự động**: Hình ảnh được tối ưu hóa để tải nhanh hơn
2. **Phân phối qua CDN**: Nội dung được phân phối qua mạng lưới CDN toàn cầu
3. **Biến đổi hình ảnh**: Dễ dàng thay đổi kích thước, cắt và áp dụng hiệu ứng
4. **Dự phòng**: Nếu máy chủ cục bộ gặp sự cố, nội dung vẫn có sẵn từ Cloudinary

### Cấu hình Cloudinary

Để sử dụng Cloudinary, bạn cần cập nhật các biến môi trường trong file `.env.local`, `.env.development` hoặc `.env.production`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 7. Xử lý lỗi

### Tệp không tải lên được

1. Kiểm tra kết nối internet
2. Đảm bảo tệp không vượt quá kích thước tối đa (10MB)
3. Kiểm tra định dạng tệp (chỉ hỗ trợ jpg, jpeg, png, gif, webp, mp4, webm, ogg)

### Tệp không hiển thị sau khi tải lên

1. Làm mới trang
2. Kiểm tra quyền truy cập thư mục uploads
3. Kiểm tra cấu hình Cloudinary

## 8. Câu hỏi thường gặp

### Tôi có thể xóa tệp khỏi Cloudinary không?

Khi bạn xóa tệp từ thư viện phương tiện, tệp sẽ bị xóa khỏi cơ sở dữ liệu cục bộ và không còn hiển thị trong thư viện. Tuy nhiên, tệp vẫn tồn tại trên Cloudinary. Để xóa hoàn toàn khỏi Cloudinary, bạn cần truy cập bảng điều khiển Cloudinary hoặc sử dụng API của Cloudinary.

### Tôi có thể tải lên tệp trực tiếp lên Cloudinary không?

Có, bạn có thể tải lên tệp trực tiếp lên Cloudinary thông qua thư viện phương tiện. Khi bạn nhấp vào nút "Cloudinary", tệp sẽ được tải lên Cloudinary và thông tin của nó sẽ được lưu trữ trong cơ sở dữ liệu cục bộ.

### Làm thế nào để sử dụng tệp từ Cloudinary trong nội dung?

Khi bạn chèn hình ảnh/video từ thư viện phương tiện, hệ thống sẽ tự động sử dụng URL Cloudinary nếu tệp được lưu trữ trên Cloudinary. Điều này giúp tận dụng các tính năng tối ưu hóa và CDN của Cloudinary.
