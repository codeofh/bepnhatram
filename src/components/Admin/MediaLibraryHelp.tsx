import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HelpCircle,
  Upload,
  CloudUpload,
  Search,
  Tag,
  Trash,
  Copy,
} from "lucide-react";

export function MediaLibraryHelp() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          Hướng dẫn sử dụng
        </CardTitle>
        <CardDescription>
          Thư viện phương tiện cho phép bạn quản lý tất cả các tệp đa phương
          tiện
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="upload">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Tải lên tệp
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <p>Có 2 cách để tải lên tệp:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Tải lên từ thiết bị</strong>: Nhấp vào nút "Tải lên"
                    và chọn tệp từ thiết bị của bạn.
                  </li>
                  <li>
                    <strong>Kéo và thả</strong>: Kéo tệp từ máy tính của bạn và
                    thả vào khu vực thư viện.
                  </li>
                </ul>
                <Alert>
                  <AlertDescription>
                    Chỉ hỗ trợ định dạng hình ảnh (jpg, jpeg, png, gif, webp) và
                    video (mp4, webm, ogg).
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cloudinary">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center gap-2">
                <CloudUpload className="h-4 w-4" />
                Tải lên Cloudinary
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <p>
                  Cloudinary là dịch vụ lưu trữ và quản lý hình ảnh/video trên
                  đám mây, giúp tối ưu hóa và phân phối nội dung qua CDN.
                </p>
                <p>Để tải lên Cloudinary:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Nhấp vào nút "Cloudinary" ở góc trên bên phải</li>
                  <li>Chọn tệp từ thiết bị của bạn</li>
                  <li>
                    Tệp sẽ được tải lên Cloudinary và hiển thị trong thư viện
                  </li>
                </ol>
                <Alert>
                  <AlertDescription>
                    Nội dung tải lên Cloudinary sẽ được tối ưu hóa tự động và
                    phân phối qua CDN toàn cầu.
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="search">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Tìm kiếm và lọc
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <p>
                  Bạn có thể dễ dàng tìm kiếm và lọc các tệp trong thư viện:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Tìm kiếm</strong>: Sử dụng thanh tìm kiếm để tìm tệp
                    theo tên hoặc thẻ.
                  </li>
                  <li>
                    <strong>Lọc theo loại</strong>: Sử dụng các tab (Tất cả,
                    Hình ảnh, Video, v.v.) để lọc tệp.
                  </li>
                  <li>
                    <strong>Sắp xếp</strong>: Sử dụng menu "Sắp xếp theo" để sắp
                    xếp tệp theo thời gian hoặc tên.
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tags">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Quản lý thẻ
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <p>Thẻ giúp bạn phân loại và tìm kiếm tệp dễ dàng hơn:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Thêm thẻ</strong>: Nhấp vào tệp để xem chi tiết, sau
                    đó nhập thẻ mới vào ô "Thêm thẻ..." và nhấn Enter.
                  </li>
                  <li>
                    <strong>Xóa thẻ</strong>: Nhấp vào biểu tượng X bên cạnh thẻ
                    để xóa.
                  </li>
                  <li>
                    <strong>Tìm kiếm theo thẻ</strong>: Nhập tên thẻ vào ô tìm
                    kiếm để tìm tất cả các tệp có thẻ đó.
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delete">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center gap-2">
                <Trash className="h-4 w-4" />
                Xóa tệp
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <p>Bạn có thể xóa tệp theo hai cách:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Xóa một tệp</strong>: Nh��p vào tệp để xem chi tiết,
                    sau đó nhấp vào nút "Xóa" và xác nhận.
                  </li>
                  <li>
                    <strong>Xóa nhiều tệp</strong>: Chọn nhiều tệp bằng cách
                    nhấp vào hộp kiểm trong góc mỗi tệp, sau đó nhấp vào nút
                    "Xóa (n)" xuất hiện ở trên.
                  </li>
                </ul>
                <Alert>
                  <AlertDescription className="text-red-500">
                    Lưu ý: Khi xóa tệp từ Cloudinary, tệp sẽ bị xóa khỏi cơ sở
                    dữ liệu nhưng vẫn còn trên Cloudinary. Để xóa hoàn toàn, bạn
                    cần truy cập bảng điều khiển Cloudinary.
                  </AlertDescription>
                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usage">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Sử dụng trong nội dung
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <p>Để sử dụng tệp trong nội dung:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Nhấp vào tệp để xem chi tiết</li>
                  <li>Nhấp vào "Sao chép URL" để sao chép đường dẫn của tệp</li>
                  <li>Dán URL vào nơi bạn muốn sử dụng</li>
                </ol>
                <p className="mt-2">
                  Hoặc sử dụng component MediaSelector trong mã của bạn:
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
                  <pre>{`import { MediaSelector } from "@/components/Admin/MediaSelector";

<MediaSelector
  onSelect={(media) => setSelectedMedia(media)}
  selectedMedia={selectedMedia}
  allowedTypes={["image", "video"]}
  buttonText="Chọn phương tiện"
/>`}</pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
