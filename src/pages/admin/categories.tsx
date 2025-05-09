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
  GripVertical,
  RefreshCw,
  Database,
  AlertTriangle,
  DownloadCloud,
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAuthContext } from "@/contexts/AuthContext";
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
import { useCategories, Category } from "@/hooks/useCategories";

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);

  // Use the categories hook
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
    importSampleCategories,
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportingData, setIsImportingData] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    }
  }, [user, authLoading, router]);

  // Show error toast if categories fetch fails
  useEffect(() => {
    if (categoriesError) {
      showError(categoriesError);
    }
  }, [categoriesError, showError]);

  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    const newCategory: Category = {
      id: "", // Empty string for new category
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

  const confirmDelete = async () => {
    if (categoryToDelete) {
      setIsSubmitting(true);
      try {
        const result = await deleteCategory(categoryToDelete.id);

        if (result.success) {
          showSuccess("Đã xóa danh mục thành công!");
        } else {
          showError(result.error || "Có lỗi xảy ra khi xóa danh mục!");
        }
      } catch (error: any) {
        showError(error.message || "Có lỗi xảy ra khi xóa danh mục!");
      } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  const saveCategory = async () => {
    if (!editingCategory) return;

    if (!editingCategory.displayName.trim()) {
      showError("Tên hiển thị không được để trống!");
      return;
    }

    setIsSubmitting(true);
    try {
      // For a new category
      if (!editingCategory.id) {
        // Create a clean category object without undefined values
        const categoryData: Record<string, any> = {
          displayName: editingCategory.displayName.trim(),
          displayOrder: editingCategory.displayOrder,
        };

        // Only include name if it's not empty
        if (editingCategory.name && editingCategory.name.trim()) {
          categoryData.name = editingCategory.name.trim();
        }

        // Only include icon if it's not empty
        if (editingCategory.icon && editingCategory.icon.trim()) {
          categoryData.icon = editingCategory.icon.trim();
        }

        const result = await addCategory(categoryData as Omit<Category, "id">);

        if (result.success) {
          showSuccess("Đã thêm danh mục mới thành công!");
          setIsEditDialogOpen(false);
        } else {
          showError(result.error || "Có lỗi xảy ra khi thêm danh mục!");
        }
      } else {
        // For updating an existing category
        // Create a clean update object without undefined values
        const updateData: Record<string, any> = {
          displayName: editingCategory.displayName.trim(),
          displayOrder: editingCategory.displayOrder,
        };

        // Only include name if it's not empty and not the "all" category
        if (
          editingCategory.id !== "all" &&
          editingCategory.name &&
          editingCategory.name.trim()
        ) {
          updateData.name = editingCategory.name.trim();
        }

        // Only include icon if it's not empty
        if (editingCategory.icon && editingCategory.icon.trim()) {
          updateData.icon = editingCategory.icon.trim();
        }

        const result = await updateCategory(
          editingCategory.id,
          updateData as Partial<Category>,
        );

        if (result.success) {
          showSuccess("Đã cập nhật danh mục thành công!");
          setIsEditDialogOpen(false);
        } else {
          showError(result.error || "Có lỗi xảy ra khi cập nhật danh mục!");
        }
      }
    } catch (error: any) {
      showError(error.message || "Có lỗi xảy ra khi lưu danh mục!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
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

    // Update in Firebase
    const result = await updateCategoryOrder(newCategories);

    if (!result.success) {
      showError(result.error || "Có lỗi xảy ra khi cập nhật thứ tự danh mục!");
    }
  };

  const handleImportSampleData = async () => {
    setIsImportingData(true);
    try {
      const result = await importSampleCategories();
      if (result.success) {
        showSuccess("Đã nhập dữ liệu mẫu thành công!");
      } else {
        showError(result.error || "Có lỗi xảy ra khi nhập dữ liệu mẫu!");
      }
    } catch (error: any) {
      console.error("Error importing sample data:", error);
      showError(error.message || "Có lỗi xảy ra khi nhập dữ liệu mẫu!");
    } finally {
      setIsImportingData(false);
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
        <title>Quản lý Danh mục - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý danh mục món ăn" />
      </Head>

      <AdminLayout title="Quản lý Danh mục">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Danh mục món ăn</CardTitle>
                <CardDescription>
                  Quản lý các danh mục món ăn hiển thị trên thực đơn
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCategories()}
                disabled={categoriesLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${categoriesLoading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <Button
                variant="outline"
                onClick={handleImportSampleData}
                disabled={categoriesLoading || isImportingData || isSubmitting}
              >
                {isImportingData ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Đang nhập...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Nhập dữ liệu mẫu
                  </>
                )}
              </Button>

              <Button
                onClick={handleAdd}
                disabled={categoriesLoading || isImportingData || isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm danh mục
              </Button>
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
                <p className="text-gray-600">Chưa có danh mục nào.</p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportSampleData}
                    disabled={isImportingData}
                  >
                    {isImportingData ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Đang nhập...
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Nhập dữ liệu mẫu
                      </>
                    )}
                  </Button>
                  <Button size="sm" onClick={handleAdd} disabled={isSubmitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm danh mục mới
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium w-12">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Tên hiển thị
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Tên code
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Icon</th>
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
                        <td className="py-3 px-4 font-mono text-sm">
                          {category.name || "-"}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {category.icon || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {category.displayOrder}
                            </span>
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveCategory(index, "up")}
                                disabled={index === 0 || categoriesLoading}
                              >
                                <MoveUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => moveCategory(index, "down")}
                                disabled={
                                  index === categories.length - 1 ||
                                  categoriesLoading
                                }
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
                              disabled={categoriesLoading}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="ml-2 hidden sm:inline">Sửa</span>
                            </Button>
                            {category.id !== "all" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDelete(category)}
                                disabled={categoriesLoading}
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
            )}
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
                {/* ID field removed - will be auto-generated from display name */}

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

                {/* Show name field for all categories except "all" */}
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
                      placeholder="T��n code cho danh mục"
                      disabled={editingCategory.id === "all"} // Can't edit name of "all" category
                    />
                    <p className="text-xs text-gray-500">
                      Tên sử dụng trong code, thường là tiếng Anh
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Input
                    value={editingCategory.icon || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        icon: e.target.value,
                      })
                    }
                    placeholder="Tên icon (ví dụ: FaUtensils, FaPizzaSlice, FaCoffee)"
                  />
                  <p className="text-xs text-gray-500">
                    Nhập tên icon từ thư viện React Icons (FA). Ví dụ:
                    FaUtensils, FaPizzaSlice, FaCoffee. Xem danh sách icon tại{" "}
                    <a
                      href="https://react-icons.github.io/react-icons/icons?name=fa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      React Icons
                    </a>
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
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button onClick={saveCategory} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
