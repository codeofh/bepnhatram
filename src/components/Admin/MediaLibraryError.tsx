import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

interface MediaLibraryErrorProps {
  onRefresh: () => void;
}

export function MediaLibraryError({ onRefresh }: MediaLibraryErrorProps) {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Xử lý lỗi tải lên
        </CardTitle>
        <CardDescription>
          Hướng dẫn khắc phục lỗi khi tải lên thư viện phương tiện
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Lỗi thường gặp
          </AlertTitle>
          <AlertDescription className="mt-2">
            Upload thành công nhưng web báo lỗi thường là do một trong các
            nguyên nhân sau:
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h3 className="font-medium">1. Lỗi quyền truy cập thư mục uploads</h3>
          <p className="text-sm text-gray-600">
            Thư mục{" "}
            <code className="bg-gray-100 px-1 rounded">
              public/uploads/library
            </code>{" "}
            cần có quyền ghi để lưu trữ tệp.
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p className="font-mono text-xs">
              chmod 755 public/uploads/library
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">2. Lỗi với Cloudinary</h3>
          <p className="text-sm text-gray-600">
            Cấu hình Cloudinary không chính xác hoặc có vấn đề với kết nối.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>
              Kiểm tra các biến môi trường Cloudinary đã được cấu hình đúng
            </li>
            <li>Kiểm tra kết nối mạng và khả năng truy cập Cloudinary API</li>
            <li>Tệp tải lên có thể vượt quá giới hạn kích thước</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">3. Lỗi API của hệ thống</h3>
          <p className="text-sm text-gray-600">
            Tệp đã được tải lên Cloudinary nhưng không thể lưu thông tin vào cơ
            sở dữ liệu của ứng dụng.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-gray-50">
              Lỗi CORS
            </Badge>
            <Badge variant="outline" className="bg-gray-50">
              Lỗi định dạng dữ liệu
            </Badge>
            <Badge variant="outline" className="bg-gray-50">
              Lỗi truyền tham số
            </Badge>
            <Badge variant="outline" className="bg-gray-50">
              Lỗi xử lý response
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại dữ liệu
          </Button>
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <a
              href="https://cloudinary.com/console"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Đi đến Cloudinary Console
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
