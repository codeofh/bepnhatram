import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Edit,
  Trash2,
  Plus,
  Save,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  ToggleLeft,
  ToggleRight,
  DownloadCloud,
  AlertTriangle,
  ImageIcon,
  Link as LinkIcon,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Layers,
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { SliderForm } from "@/components/Admin/SliderForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { SliderItem, useSliderManagement } from "@/hooks/useSliderManagement";

export default function AdminSlidersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [currentSlider, setCurrentSlider] = useState<SliderItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInitializeConfirm, setShowInitializeConfirm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    getAllSliders,
    addSlider,
    updateSlider,
    deleteSlider,
    updateSlidersOrder,
    initializeDefaultSliders,
    loading: firebaseLoading,
    error: firebaseError,
  } = useSliderManagement();

  // Fetch sliders from Firebase
  const fetchSliders = useCallback(async () => {
    try {
      const data = await getAllSliders();
      setSliders(data);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      showError("Không thể tải danh sách slider từ cơ sở dữ liệu");
    }
  }, [getAllSliders, showError]);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    } else if (user) {
      fetchSliders();
    }
  }, [user, authLoading, router, fetchSliders, refreshTrigger]);

  const handleCreateSlider = () => {
    setCurrentSlider(null);
    setIsDialogOpen(true);
  };

  const handleEditSlider = (slider: SliderItem) => {
    setCurrentSlider(slider);
    setIsDialogOpen(true);
  };

  const handleDeleteSlider = (slider: SliderItem) => {
    setCurrentSlider(slider);
    setIsConfirmDelete(true);
  };

  const handleToggleActive = async (slider: SliderItem) => {
    try {
      const success = await updateSlider(slider.id, {
        isActive: !slider.isActive,
      });

      if (success) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi cập nhật trạng thái slider!");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;

    const newSliders = [...sliders];
    const temp = newSliders[index];
    newSliders[index] = newSliders[index - 1];
    newSliders[index - 1] = temp;

    try {
      const success = await updateSlidersOrder(newSliders);
      if (success) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi thay đổi thứ tự slider!");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= sliders.length - 1) return;

    const newSliders = [...sliders];
    const temp = newSliders[index];
    newSliders[index] = newSliders[index + 1];
    newSliders[index + 1] = temp;

    try {
      const success = await updateSlidersOrder(newSliders);
      if (success) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi thay đổi thứ tự slider!");
    }
  };

  const confirmDelete = async () => {
    if (currentSlider) {
      try {
        const success = await deleteSlider(currentSlider.id);
        if (success) {
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa slider!");
      } finally {
        setIsConfirmDelete(false);
        setCurrentSlider(null);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (currentSlider) {
        // Update existing slider
        const success = await updateSlider(currentSlider.id, data);
        if (success) {
          setRefreshTrigger((prev) => prev + 1);
          setIsDialogOpen(false);
        }
      } else {
        // Create new slider
        // Set display order to be the next in sequence
        const displayOrder =
          sliders.length > 0
            ? Math.max(...sliders.map((s) => s.displayOrder)) + 1
            : 0;

        const newItemId = await addSlider({
          ...data,
          displayOrder,
          isActive: data.isActive !== undefined ? data.isActive : true,
        });

        if (newItemId) {
          setRefreshTrigger((prev) => prev + 1);
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu slider!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize sliders with default data
  const handleInitializeData = async () => {
    setShowInitializeConfirm(false);
    try {
      const success = await initializeDefaultSliders();
      if (success) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi khởi tạo dữ liệu!");
    }
  };

  if (authLoading || !isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Quản lý Slider - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý slider trang chủ" />
      </Head>

      <AdminLayout title="Quản lý Slider Trang Chủ">
        {/* Actions */}
        <div className="flex justify-end gap-2 mb-6">
          {sliders.length === 0 && (
            <Button
              onClick={() => setShowInitializeConfirm(true)}
              variant="outline"
            >
              <DownloadCloud className="mr-2 h-4 w-4" />
              Nhập dữ liệu mẫu
            </Button>
          )}
          <Button onClick={handleCreateSlider}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Slider Mới
          </Button>
        </div>

        {/* Sliders list */}
        {firebaseLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}

        {firebaseError && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{firebaseError}</span>
          </div>
        )}

        {!firebaseLoading && sliders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Chưa có slider nào
              </h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Hiện tại chưa có slider nào được cấu hình. Bạn có thể thêm
                slider mới hoặc nhập dữ liệu mẫu.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowInitializeConfirm(true)}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Nhập dữ liệu mẫu
                </Button>
                <Button onClick={handleCreateSlider}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Slider Mới
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Thứ tự hiển thị</TableHead>
                  <TableHead className="w-[120px]">Ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Nút kêu gọi
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="hidden md:table-cell w-[180px]">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders.map((slider, index) => (
                  <TableRow key={slider.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {slider.displayOrder || index + 1}
                        </span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="h-6 w-6 hover:bg-gray-100"
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === sliders.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="h-6 w-6 hover:bg-gray-100"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-20 h-14 rounded-md overflow-hidden">
                        {slider.image ? (
                          <Image
                            src={slider.image}
                            alt={slider.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {slider.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-60 truncate">
                      {slider.description}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <span className="mr-2">{slider.cta}</span>
                        {slider.ctaLink && (
                          <LinkIcon className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(slider)}
                        className={
                          slider.isActive ? "text-green-600" : "text-red-600"
                        }
                      >
                        {slider.isActive ? (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Hiển thị
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Ẩn
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {slider.createdAt
                          ? new Date(
                              slider.createdAt.toDate(),
                            ).toLocaleDateString("vi-VN")
                          : "N/A"}
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        {slider.createdAt
                          ? new Date(
                              slider.createdAt.toDate(),
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Chỉnh sửa"
                          onClick={() => handleEditSlider(slider)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${slider.isActive ? "text-green-600 hover:text-green-800 hover:bg-green-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                          title={
                            slider.isActive
                              ? "Đang hiển thị - Click để ẩn"
                              : "Đang ẩn - Click để hiển thị"
                          }
                          onClick={() => handleToggleActive(slider)}
                        >
                          {slider.isActive ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Xóa"
                          onClick={() => handleDeleteSlider(slider)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditSlider(slider)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(slider)}
                            >
                              {slider.isActive ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Ẩn slider
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Hiển thị slider
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteSlider(slider)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sliders.map((slider, index) => (
              <div key={slider.id} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b flex items-start gap-3">
                  <div className="relative w-24 h-20 rounded-md overflow-hidden flex-shrink-0">
                    {slider.image ? (
                      <Image
                        src={slider.image}
                        alt={slider.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base line-clamp-1">{slider.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{slider.description}</p>

                    <div className="mt-2 flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slider.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {slider.isActive ? "Hiển thị" : "Ẩn"}
                      </span>

                      {slider.cta && (
                        <div className="ml-2 text-xs flex items-center text-blue-600">
                          <span className="mr-1">{slider.cta}</span>
                          {slider.ctaLink && <LinkIcon className="h-3 w-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 flex items-center justify-between bg-gray-50 border-b">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium text-gray-700 mr-1">Thứ tự:</span>
                    <span>{slider.displayOrder || index + 1}</span>
                  </div>

                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="h-8 w-8 hover:bg-gray-200"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === sliders.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="h-8 w-8 hover:bg-gray-200"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(slider)}
                    className={slider.isActive ? "text-green-600" : "text-red-600"}
                  >
                    {slider.isActive ? (
                      <>
                        <ToggleRight className="mr-2 h-4 w-4" />
                        Hiển thị
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Ẩn
                      </>
                    )}
                  </Button>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-blue-600 border-blue-200"
                      onClick={() => handleEditSlider(slider)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-red-600 border-red-200"
                      onClick={() => handleDeleteSlider(slider)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Slider Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentSlider ? "Chỉnh sửa slider" : "Thêm slider mới"}
              </DialogTitle>
              <DialogDescription>
                {currentSlider
                  ? "Cập nhật thông tin slider đã có"
                  : "Điền thông tin để thêm slider mới vào trang chủ"}
              </DialogDescription>
            </DialogHeader>
            <SliderForm
              initialData={currentSlider || undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isConfirmDelete} onOpenChange={setIsConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa slider "{currentSlider?.title}" khỏi
                trang chủ? Hành động này không thể khôi phục.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmDelete(false)}
                disabled={firebaseLoading}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={firebaseLoading}
              >
                {firebaseLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Initialize Data Confirmation Dialog */}
        <Dialog
          open={showInitializeConfirm}
          onOpenChange={setShowInitializeConfirm}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Khởi tạo dữ liệu mẫu</DialogTitle>
              <DialogDescription>
                Thao tác này sẽ nhập các slider mẫu vào cơ sở dữ liệu. Bạn có
                chắc chắn muốn tiếp tục không?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInitializeConfirm(false)}
                disabled={firebaseLoading}
              >
                Hủy
              </Button>
              <Button onClick={handleInitializeData} disabled={firebaseLoading}>
                {firebaseLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Khởi tạo dữ liệu"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}