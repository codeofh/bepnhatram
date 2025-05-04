import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Save,
  MoveUp,
  MoveDown,
  GripVertical
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { siteConfig } from "@/config/siteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastContext } from "@/contexts/ToastContext";

interface Category {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  icon?: string;
}

export default function AdminCategoriesPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "Tất cả", displayName: "Tất cả", displayOrder: 0 },
    { id: "special", name: "special", displayName: "Đặc biệt", displayOrder: 1 },
    { id: "main", name: "main", displayName: "Món chính", displayOrder: 2 },
    { id: "chicken", name: "chicken", displayName: "Gà ủ muối", displayOrder: 3 },
    { id: "chicken-feet", name: "chicken-feet", displayName: "Chân gà", displayOrder: 4 },
    { id: "drinks", name: "drinks", displayName: "Đồ uống", displayOrder: 5 },
  ]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    const newCategory: Category = {
      id: "",
      name: "",
      displayName: "",
      displayOrder: categories.length,
    };
    setEditingCategory(newCategory);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      if (categoryToDelete.id === "all") {
        showError("Không thể xóa danh mục mặc định!");
        return;
      }

      try {
        // In a real app, this would delete from Firebase
        const newCategories = categories.filter(
          (c) => c.id !== categoryToDelete.id
        );
        setCategories(newCategories);
        showSuccess("Đã xóa danh mục thành công!");
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa danh mục!");
      } finally {
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  const saveCategory = () => {
    if (!editingCategory) return;

    if (!editingCategory.displayName.trim()) {
      showError("Tên hiển thị không được để trống!");
      return;
    }

    try {
      // For a new category
      if (!editingCategory.id) {
        const id = editingCategory.name
          ? editingCategory.name.toLowerCase().replace(/\s+/g, "-")
          : editingCategory.displayName.toLowerCase().replace(/\s+/g, "-");

        const newCategory = {
          ...editingCategory,
          id,
          name: editingCategory.name || id,
        };

        setCategories([...categories, newCategory]);
        showSuccess("Đã thêm danh mục mới thành công!");
      } else {
        // For updating an existing category
        const isDefault = editingCategory.id === "all";
        const updatedCategories = categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...editingCategory,
                // Don't allow changing ID or name of "all" category
                id: isDefault ? "all" : editingCategory.id,
                name: isDefault ? "Tất cả" : editingCategory.name,
              }
            : c
        );
        setCategories(updatedCategories);
        showSuccess("Đã cập nhật danh mục thành công!");
      }

      setIsEditDialogOpen(false);
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu danh mục!");
    }
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap the display orders
    const currentOrder = newCategories[index].displayOrder;
    newCategories[index].displayOrder = newCategories[newIndex].displayOrder;
    newCategories[newIndex].displayOrder = currentOrder;
    
    // Sort by displayOrder
    newCategories.sort((a, b) => a.displayOrder - b.displayOrder);
    
    setCategories(newCategories);
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
        <title>Quản lý Danh mục - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý danh mục món ăn" />
      </Head>

      <AdminLayout title="Quản lý Danh mục">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Danh mục món ăn</CardTitle>
            <CardDescription>
              Quản lý các danh mục món ăn hiển thị trên thực đơn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm danh mục
              </Button>
            </div>

            <div className="bg-white rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium w-12">#</th>
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Tên hiển thị
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Thứ tự
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category.id} className="border-b">
                      <td className="py-3 px-4">
                        <span className="flex items-center text-gray-500">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {category.id}
                      </td>
                      <td className="py-3 px-4">{category.displayName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">{category.displayOrder}</span>
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveCategory(index, "up")}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => moveCategory(index, "down")}
                              disabled={index === categories.length - 1}
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">
                              Sửa
                            </span>
                          </Button>
                          {category.id !== "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-2 hidden sm:inline">
                                Xóa
                              </span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory && editingCategory.id
                  ? "Chỉnh sửa danh mục"
                  : "Thêm danh mục mới"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory && editingCategory.id
                  ? "Cập nhật thông tin danh mục"
                  : "Nhập thông tin cho danh mục mới"}
              </DialogDescription>
            </DialogHeader>

            {editingCategory && (
              <div className="space-y-4">
                {editingCategory.id !== "all" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ID/Mã</label>
                    <Input
                      value={editingCategory.id}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          id: e.target.value,
                        })
                      }
                      placeholder="ID danh mục (không dấu, dùng gạch ngang)"
                      disabled={!!editingCategory.id} // Can't edit ID of existing category
                    />
                    <p className="text-xs text-gray-500">
                      ID dùng để định danh danh mục, chỉ bao gồm chữ cái, số và dấu gạch ngang
                    </p>
                  </div>
                )}

                {editingCategory.id !== "all" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tên code</label>
                    <Input
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                      placeholder="Tên code cho danh mục"
                      disabled={editingCategory.id === "all"} // Can't edit name of "all" category
                    />
                    <p className="text-xs text-gray-500">
                      Tên sử dụng trong code, thường là tiếng Anh
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên hiển thị</label>
                  <Input
                    value={editingCategory.displayName}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        displayName: e.target.value,
                      })
                    }
                    placeholder="Tên hiển thị cho người dùng"
                  />
                  <p className="text-xs text-gray-500">
                    Tên hiển thị cho người dùng, thường là tiếng Việt
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Thứ tự hiển thị</label>
                  <Input
                    type="number"
                    value={editingCategory.displayOrder}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                  <p className="text-xs text-gray-500">
                    Số thấp hơn hiển thị trước, bắt đầu từ 0
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={saveCategory}>
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa danh mục "
                {categoryToDelete?.displayName}"? Hành động này không thể khôi
                phục.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
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