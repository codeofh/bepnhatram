import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { MenuItemForm } from "@/components/Admin/MenuItemForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";
import { MenuItem, menuItems } from "@/data/menuItems";
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
  const { user, loading } = useAuthContext();
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

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    } else {
      setItems(menuItems);
    }
  }, [user, loading, router]);

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

  const confirmDelete = () => {
    if (currentItem) {
      try {
        // In a real app, here you would delete from Firebase
        const newItems = items.filter((item) => item.id !== currentItem.id);
        setItems(newItems);
        showSuccess("Đã xóa món ăn thành công!");
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
      // In a real app, this would save to Firebase
      if (currentItem) {
        // Update existing item
        const updatedItems = items.map((item) =>
          item.id === currentItem.id ? { ...data, id: currentItem.id } : item,
        );
        setItems(updatedItems);
        showSuccess("Đã cập nhật món ăn thành công!");
      } else {
        // Create new item
        const newItem = {
          ...data,
          id: `temp-${Date.now()}`, // In real app, this would be a Firebase ID
          rating: data.rating || 4,
        };
        setItems([...items, newItem]);
        showSuccess("Đã thêm món ăn mới thành công!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu món ăn!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isClient) {
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
                  <SelectItem value="chicken">Gà ủ muối</SelectItem>
                  <SelectItem value="chicken-feet">Chân gà</SelectItem>
                  <SelectItem value="drinks">Đồ uống</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreateItem} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Thêm món ăn
          </Button>
        </div>

        {/* Menu items table */}
        <div className="bg-white rounded-md border overflow-hidden">
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
              >
                Hủy
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
