import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Eye,
  ArrowUpDown,
  MoreHorizontal,
  X,
  Loader2,
  DownloadCloud,
  AlertTriangle,
  Database,
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { MenuItemForm } from "@/components/Admin/MenuItemForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";
import { MenuItem } from "@/data/menuItems";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMenuManagement } from "@/hooks/useMenuManagement";

export default function AdminMenuPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof MenuItem>("displayOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    importSampleMenuItems,
    loading: firebaseLoading,
    error: firebaseError,
  } = useMenuManagement();

  // Fetch menu items from Firebase
  const fetchItems = useCallback(async () => {
    try {
      const result = await getAllMenuItems();
      setItems(result.items || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      showError("Không thể tải danh sách món ăn từ cơ sở dữ liệu");
    }
  }, [getAllMenuItems, showError]);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    } else if (user) {
      fetchItems();
    }
  }, [user, authLoading, router, fetchItems, refreshTrigger]);

  const handleSortChange = (field: keyof MenuItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  const handleCreateItem = () => {
    setCurrentItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    setCurrentItem(item);
    setIsConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (currentItem) {
      try {
        const success = await deleteMenuItem(currentItem.id);
        if (success) {
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa món ăn!");
      } finally {
        setIsConfirmDelete(false);
        setCurrentItem(null);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (currentItem) {
        // Update existing item
        const success = await updateMenuItem(currentItem.id, data);
        if (success) {
          setRefreshTrigger((prev) => prev + 1);
          setIsDialogOpen(false);
        }
      } else {
        // Create new item
        const newItemId = await addMenuItem(data);
        if (newItemId) {
          setRefreshTrigger((prev) => prev + 1);
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu món ăn!");
    } finally {
      setIsSubmitting(false);
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
        <title>Quản lý Menu - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý menu và món ăn" />
      </Head>

      <AdminLayout title="Quản lý Menu">
        {/* Search and filters - Mobile optimized */}
        <div className="flex flex-col mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="w-full sm:w-auto sm:min-w-[120px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tất cả danh mục" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="special">Đặc biệt</SelectItem>
                  <SelectItem value="main">Món chính</SelectItem>
                  <SelectItem value="chicken">Gà ủ muối</SelectItem>
                  <SelectItem value="chicken-feet">Chân gà</SelectItem>
                  <SelectItem value="drinks">Đồ uống</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const success = await importSampleMenuItems();
                  if (success) {
                    setRefreshTrigger((prev) => prev + 1);
                  }
                } catch (error) {
                  showError("Có lỗi xảy ra khi nhập dữ liệu mẫu!");
                }
              }}
              disabled={firebaseLoading}
            >
              {firebaseLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Đang nhập...</span>
                  <span className="sm:hidden">Nhập...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Nhập dữ liệu mẫu</span>
                  <span className="sm:hidden">Nhập mẫu</span>
                </>
              )}
            </Button>
            <Button onClick={handleCreateItem}>
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Thêm món ăn</span>
              <span className="sm:hidden">Thêm mới</span>
            </Button>
          </div>
        </div>

        {/* Loading and error states */}
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

        {/* Empty state */}
        {!firebaseLoading && items.length === 0 ? (
          <div className="bg-white rounded-md border p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có món ăn nào
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Hiện chưa có món ăn nào trong hệ thống. Bạn có thể thêm món ăn mới
              hoặc nhập dữ liệu mẫu.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const success = await importSampleMenuItems();
                    if (success) {
                      setRefreshTrigger((prev) => prev + 1);
                    }
                  } catch (error) {
                    showError("Có lỗi xảy ra khi nhập dữ liệu mẫu!");
                  }
                }}
                disabled={firebaseLoading}
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Nhập dữ liệu mẫu
              </Button>
              <Button onClick={handleCreateItem}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm món ăn
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="bg-white rounded-md border overflow-hidden hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Ảnh</TableHead>
                    <TableHead className="min-w-40">
                      <Button
                        variant="ghost"
                        className="p-0 font-bold"
                        onClick={() => handleSortChange("name")}
                      >
                        Tên món
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Mô tả
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="p-0 font-bold"
                        onClick={() => handleSortChange("price")}
                      >
                        Giá
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Button
                        variant="ghost"
                        className="p-0 font-bold"
                        onClick={() => handleSortChange("category")}
                      >
                        Danh mục
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-20 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        Không tìm thấy món ăn nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-md overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-52 truncate">
                          {item.description}
                        </TableCell>
                        <TableCell>
                          {item.price.toLocaleString()}đ
                          {item.sizes && item.sizes.length > 0 && (
                            <span className="text-xs text-gray-500 block">
                              + {item.sizes.length} tùy chọn
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                            {item.category === "special" && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                Đặc biệt
                              </span>
                            )}
                            {item.category === "main" && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                Món chính
                              </span>
                            )}
                            {item.category === "chicken" && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Gà ủ muối
                              </span>
                            )}
                            {item.category === "chicken-feet" && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                Chân gà
                              </span>
                            )}
                            {item.category === "drinks" && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Đồ uống
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem trước
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteItem(item)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-md border p-6 text-center text-gray-500">
                  Không tìm thấy món ăn nào
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-md border overflow-hidden"
                  >
                    <div className="flex items-center p-4 border-b">
                      <div className="w-14 h-14 rounded-md overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="font-semibold text-orange-600">
                            {item.price.toLocaleString()}đ
                          </span>
                          {item.sizes && item.sizes.length > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              + {item.sizes.length} tùy chọn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize">
                          {item.category === "special" && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              Đặc biệt
                            </span>
                          )}
                          {item.category === "main" && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Món chính
                            </span>
                          )}
                          {item.category === "chicken" && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                              Gà ủ muối
                            </span>
                          )}
                          {item.category === "chicken-feet" && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Chân gà
                            </span>
                          )}
                          {item.category === "drinks" && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Đồ uống
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="h-8 px-2 text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="h-8 px-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Add/Edit Menu Item Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
              </DialogTitle>
              <DialogDescription>
                {currentItem
                  ? "Cập nhật thông tin món ăn đã có"
                  : "Điền thông tin để thêm món ăn mới vào thực đơn"}
              </DialogDescription>
            </DialogHeader>
            <MenuItemForm
              initialData={currentItem || undefined}
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
                Bạn có chắc chắn muốn xóa món ăn "{currentItem?.name}" khỏi thực
                đơn? Hành động này không thể khôi phục.
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
      </AdminLayout>
    </>
  );
}
