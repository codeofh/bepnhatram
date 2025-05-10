import React from "react";
import Head from "next/head";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  CloudUpload,
  HardDrive,
  Image,
  Video,
} from "lucide-react";

export default function MediaHelpPage() {
  return (
    <>
      <Head>
        <title>Hướng dẫn thư viện phương tiện - Admin</title>
        <meta
          name="description"
          content="Hướng dẫn sử dụng thư viện phương tiện"
        />
      </Head>

      <AdminLayout title="Hướng dẫn thư viện phương tiện">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" asChild>
            <Link href="/admin/media-library">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại thư viện phương tiện
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="/docs/media-library-guide.md" target="_blank">
              <FileText className="h-4 w-4 mr-2" />
              Xem tài liệu đầy đủ
            </a>
          </Button>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan về thư viện phương tiện</CardTitle>
              <CardDescription>
                Thư viện phương tiện cho phép bạn quản lý tất cả các tệp đa
                phương tiện (hình ảnh, video) được sử dụng trong trang web.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Thư viện phương tiện là nơi tập trung để quản lý, tải lên và sử
                dụng tất cả các tệp đa phương tiện trong trang web của bạn. Bạn
                có thể dễ dàng tải lên, tìm kiếm, phân loại và sử dụng lại các
                tệp này trong nội dung của bạn.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="border rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                  <Image className="h-10 w-10 text-primary" />
                  <h3 className="font-medium">Hình ảnh</h3>
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ các định dạng JPG, PNG, GIF, WebP, SVG.
                  </p>
                </div>
                <div className="border rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                  <Video className="h-10 w-10 text-primary" />
                  <h3 className="font-medium">Video</h3>
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ các định dạng MP4, WebM, OGG.
                  </p>
                </div>
                <div className="border rounded-lg p-4 flex flex-col items-center text-center space-y-2">
                  <CloudUpload className="h-10 w-10 text-primary" />
                  <h3 className="font-medium">Lưu trữ đám mây</h3>
                  <p className="text-sm text-muted-foreground">
                    Tích hợp với Cloudinary để tối ưu hóa và phân phối.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Lưu trữ cục bộ
                </CardTitle>
                <CardDescription>
                  Tệp được lưu trữ trên máy chủ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Ưu điểm:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Kiểm soát hoàn toàn các tệp</li>
                  <li>Không cần dịch vụ bên ngoài</li>
                  <li>Không có chi phí bổ sung</li>
                </ul>
                <h3 className="font-medium">Hạn chế:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Giới hạn về không gian lưu trữ</li>
                  <li>Không có tối ưu hóa tự động</li>
                  <li>Không có mạng phân phối nội dung (CDN)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Mặc định, tất cả các tệp được tải lên sẽ được lưu trữ trong
                  thư mục "/public/uploads/library/" trên máy chủ.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudUpload className="h-5 w-5" />
                  Lưu trữ Cloudinary
                </CardTitle>
                <CardDescription>
                  Tệp được lưu trữ trên dịch vụ đám mây Cloudinary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Ưu điểm:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tối ưu hóa hình ảnh tự động</li>
                  <li>Phân phối qua mạng CDN toàn cầu</li>
                  <li>Biến đổi hình ảnh dễ dàng (kích thước, cắt, hiệu ứng)</li>
                  <li>Dự phòng khi máy chủ cục bộ gặp sự cố</li>
                </ul>
                <h3 className="font-medium">Cấu hình:</h3>
                <p className="text-sm">
                  Để sử dụng Cloudinary, bạn cần cập nhật các biến môi trường:
                </p>
                <div className="bg-muted p-3 rounded text-sm">
                  <pre className="text-xs">
                    {`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sử dụng trong mã</CardTitle>
              <CardDescription>
                Cách sử dụng MediaSelector để chọn phương tiện trong các form
                hoặc trình soạn thảo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Component <code>MediaSelector</code> cho phép bạn dễ dàng chọn
                phương tiện từ thư viện để sử dụng trong form hoặc trình soạn
                thảo.
              </p>
              <div className="bg-muted p-4 rounded overflow-x-auto">
                <pre className="text-sm">
                  {`import { MediaSelector } from "@/components/Admin/MediaSelector";
import { MediaItem } from "@/lib/mediaLibrary";

// Trong component của bạn
const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

// Trong JSX
<MediaSelector
  onSelect={(media) => setSelectedMedia(media)}
  selectedMedia={selectedMedia}
  allowedTypes={["image"]} // hoặc ["video"] hoặc ["image", "video"]
  buttonText="Chọn hình ảnh"
/>`}
                </pre>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-medium mb-3">
                Sử dụng thư viện mediaLibrary.ts
              </h3>
              <p className="mb-4">
                Thư viện <code>mediaLibrary.ts</code> cung cấp hook{" "}
                <code>useMediaLibrary</code> cho phép bạn tương tác với thư viện
                phương tiện trong code React của bạn:
              </p>
              <div className="bg-muted p-4 rounded overflow-x-auto">
                <pre className="text-sm">
                  {`import { useMediaLibrary } from "@/lib/mediaLibrary";

function YourComponent() {
  const { 
    isLoading,
    mediaItems,
    error,
    uploadFile,
    deleteItem,
    updateItem,
    refreshItems
  } = useMediaLibrary();

  // Tải lên tệp
  const handleUpload = async (file) => {
    const item = await uploadFile(file, "cloudinary"); // hoặc "local"
    console.log("Đã tải lên:", item);
  };

  // Hiển thị danh sách tệp
  return (
    <div>
      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <ul>
          {mediaItems.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
