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
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { MenuItemForm } from "@/components/Admin/MenuItemForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";
import { MenuItem, menuItems as staticMenuItems } from "@/data/menuItems";
import { useMenuManagement } from "@/hooks/useMenuManagement";
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
import { useToastContext } from "@/contexts/ToastContext";

export default function AdminMenuPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showInitializeConfirm, setShowInitializeConfirm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const {
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    initializeMenuCollection,
    loading: firebaseLoading,
    error: firebaseError,
  } = useMenuManagement();
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof MenuItem>("displayOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch menu items from Firebase with pagination
  const fetchItems = useCallback(async () => {
    try {
      // Use the sort field and direction from state
      const result = await getAllMenuItems(
        currentPage,
        itemsPerPage,
        sortField,
        sortDirection,
      );

      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      showError("Không thể tải danh sách món ăn từ cơ sở dữ liệu");
    }
  }, [getAllMenuItems, showError, currentPage, sortField, sortDirection]);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    } else if (user) {
      fetchItems();
    }
  }, [user, authLoading, router, fetchItems, refreshTrigger]);

  // Re-fetch when pagination, sort or filters change
  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [currentPage, sortField, sortDirection, fetchItems, user]);

  const handleSortChange = (field: keyof MenuItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // Reset to first page when sort changes
    setCurrentPage(1);
  };

  // Apply local filtering to the paginated items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    // Validate page
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  // Initialize menu collection with sample data
  const handleInitializeData = async () => {
    setShowInitializeConfirm(false);
    try {
      // Make sure we pass a copy of the static menu items to avoid mutation issues
      const menuItemsCopy = JSON.parse(JSON.stringify(staticMenuItems));
      const success = await initializeMenuCollection(menuItemsCopy);
      if (success) {
        // Refresh the data after initialization
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
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
    router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    return null;
  }

  return (
    <>
      <Head>
        <title>Quản lý Menu - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý menu và món ăn" />
      </Head>

      <AdminLayout title="Quản lý Menu">
        {/* Filters and actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
            <div className="relative w-full md:w-64">
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

            <div className="w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tất cả danh mục" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="special">Đặc biệt</SelectItem>
                  <SelectItem value="main">Món chính</SelectItem>
                  <SelectItem value="chicken">Gà ủ mu��i</SelectItem>
                  <SelectItem value="chicken-feet">Chân gà</SelectItem>
                  <SelectItem value="drinks">Đồ uống</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            {items.length === 0 && (
              <Button
                onClick={() => setShowInitializeConfirm(true)}
                variant="outline"
                className="w-full md:w-auto"
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Nhập dữ liệu mẫu
              </Button>
            )}
            <Button onClick={handleCreateItem} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Thêm món ăn
            </Button>
          </div>
        </div>

        {/* Menu items table */}
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

        <div className="bg-white rounded-md border overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b">
            <p className="text-sm text-gray-500">
              {totalItems > 0 ? (
                <>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} trên tổng
                  số {totalItems} món ăn
                </>
              ) : (
                <>Không có món ăn nào</>
              )}
            </p>
          </div>
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
                <TableHead className="hidden md:table-cell">Mô tả</TableHead>
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
                    <TableCell className="font-medium">{item.name}</TableCell>
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

          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Ellipsis for many pages */}
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Page before current */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink
                      isActive
                      onClick={() => handlePageChange(currentPage)}
                    >
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {/* Page after current */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Ellipsis for many pages */}
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Add/Edit Menu Item Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        {/* Initialize Data Confirmation Dialog */}
        <Dialog
          open={showInitializeConfirm}
          onOpenChange={setShowInitializeConfirm}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Khởi tạo dữ liệu mẫu</DialogTitle>
              <DialogDescription>
                Thao tác này sẽ nhập các món ăn mẫu vào cơ sở dữ liệu. Bạn có
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
