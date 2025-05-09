import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  User as UserIcon,
  MoreHorizontal,
  X,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { UserForm } from "@/components/Admin/UserForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";
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
import { useUsers, UserData } from "@/hooks/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    users,
    loading: usersLoading,
    error: usersError,
    getUsers,
    updateUser,
    deleteUser,
    makeAdmin,
    removeAdmin,
    blockUser,
    activateUser,
    generateSampleUsers,
  } = useUsers();

  // Function to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(
            typeof timestamp === "number" ? timestamp : timestamp.toDate(),
          );

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Function to get user initials for avatar
  const getUserInitials = (name: string): string => {
    if (!name) return "?";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Filter users
  useEffect(() => {
    const filterUsers = () => {
      let result = [...users];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (user) =>
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.includes(query),
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        result = result.filter((user) => user.status === statusFilter);
      }

      // Apply role filter
      if (roleFilter !== "all") {
        if (roleFilter === "admin") {
          result = result.filter((user) => user.role?.admin);
        } else if (roleFilter === "customer") {
          result = result.filter(
            (user) => user.role?.customer && !user.role?.admin,
          );
        }
      }

      setFilteredUsers(result);
    };

    filterUsers();
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Fetch users from Firebase
  const fetchUsers = useCallback(async () => {
    await getUsers();
  }, [getUsers]);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(router.asPath));
    } else if (user) {
      fetchUsers();
    }
  }, [user, authLoading, router, fetchUsers, refreshTrigger]);

  // Handle user editing
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setIsConfirmDeleteOpen(true);
  };

  // Confirm user deletion
  const confirmDelete = async () => {
    if (selectedUser) {
      setIsSubmitting(true);
      try {
        const success = await deleteUser(selectedUser.id);
        if (success) {
          setIsConfirmDeleteOpen(false);
          setSelectedUser(null);
          showSuccess("Xóa người dùng thành công!");
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (error) {
        showError("Có lỗi xảy ra khi xóa người dùng!");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Update user
        const updateData: Partial<UserData> = {
          name: data.name,
          phone: data.phone,
          status: data.status,
        };

        const success = await updateUser(selectedUser.id, updateData);

        // Handle admin role separately
        if (success) {
          if (data.isAdmin && !selectedUser.role?.admin) {
            await makeAdmin(selectedUser.id);
          } else if (!data.isAdmin && selectedUser.role?.admin) {
            await removeAdmin(selectedUser.id);
          }

          setIsDialogOpen(false);
          setRefreshTrigger((prev) => prev + 1);
        }
      }
    } catch (error: any) {
      showError(error.message || "Có lỗi xảy ra khi lưu thông tin người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user admin status
  const toggleAdminStatus = async (user: UserData) => {
    setIsSubmitting(true);
    try {
      if (user.role?.admin) {
        await removeAdmin(user.id);
      } else {
        await makeAdmin(user.id);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showError("Có lỗi xảy ra khi thay đổi quyền admin!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (user: UserData) => {
    setIsSubmitting(true);
    try {
      if (user.status === "blocked") {
        await activateUser(user.id);
      } else {
        await blockUser(user.id);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showError("Có lỗi xảy ra khi thay đổi trạng thái người dùng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate sample users
  const handleGenerateSampleUsers = async () => {
    try {
      await generateSampleUsers(10);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showError("Có lỗi xảy ra khi tạo người dùng mẫu!");
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
        <title>Quản lý người dùng - {siteConfig.name} Admin</title>
        <meta name="description" content="Quản lý người dùng" />
      </Head>

      <AdminLayout title="Quản lý người dùng">
        {/* Filters and actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm người dùng..."
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

            <div className="w-full md:w-auto flex flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="pending">Chờ xác thực</SelectItem>
                  <SelectItem value="blocked">Đã khóa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tất cả quyền" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả quyền</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateSampleUsers}
              className="whitespace-nowrap"
            >
              <Download className="mr-2 h-4 w-4" />
              Tạo người dùng mẫu
            </Button>
            <Button
              variant="outline"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              disabled={usersLoading}
              className="h-10 w-10 p-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {usersLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Error state */}
        {usersError && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{usersError}</span>
          </div>
        )}

        {/* Empty state */}
        {!usersLoading && filteredUsers.length === 0 && (
          <div className="bg-white rounded-md border p-8 text-center">
            <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {users.length === 0
                ? "Chưa có người dùng nào"
                : "Không tìm thấy người dùng nào"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {users.length === 0
                ? "Hiện chưa có người dùng nào trong hệ thống. Bạn có thể tạo người dùng mẫu để kiểm thử."
                : "Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại."}
            </p>
            {users.length === 0 && (
              <Button onClick={handleGenerateSampleUsers}>
                <Download className="mr-2 h-4 w-4" />
                Tạo người dùng mẫu
              </Button>
            )}
          </div>
        )}

        {/* Users table */}
        {!usersLoading && filteredUsers.length > 0 && (
          <div className="bg-white rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Avatar</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Điện thoại
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Ngày tạo
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Quyền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.photoURL} alt={user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.phone ? (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.status === "active" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Đang hoạt động
                        </Badge>
                      )}
                      {user.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Chờ xác thực
                        </Badge>
                      )}
                      {user.status === "blocked" && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Đã khóa
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role?.admin ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Khách hàng
                        </Badge>
                      )}
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
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => toggleAdminStatus(user)}
                          >
                            {user.role?.admin ? (
                              <>
                                <ShieldX className="mr-2 h-4 w-4 text-red-500" />
                                <span className="text-red-500">
                                  Thu hồi quyền Admin
                                </span>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="mr-2 h-4 w-4 text-purple-500" />
                                <span className="text-purple-500">
                                  Cấp quyền Admin
                                </span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === "blocked" ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-green-500">
                                  Kích hoạt tài khoản
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span className="text-red-500">
                                  Khóa tài khoản
                                </span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa người dùng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin người dùng
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <UserForm
                initialData={selectedUser}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isConfirmDeleteOpen}
          onOpenChange={setIsConfirmDeleteOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.name}" khỏi
                hệ thống? Hành động này không thể khôi phục.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(false)}
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
