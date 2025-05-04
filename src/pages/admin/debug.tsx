import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDebugPage() {
  const { user, loading, error, createAdminUser } = useAdminAuth();
  const { user: authUser } = useAuthContext();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<{db: boolean, auth: boolean}>({
    db: false,
    auth: false
  });
  const [actionMessage, setActionMessage] = useState<{type: "success" | "error", message: string} | null>(null);

  useEffect(() => {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      router.push('/admin/dashboard');
    }
    
    if (!loading && !user) {
      router.push('/admin');
    }
    
    // Check Firebase status
    const checkFirebase = async () => {
      try {
        const authStatus = !!authUser;
        
        let dbStatus = false;
        if (db) {
          try {
            // Try to read from Firestore
            const testQuery = await getDocs(collection(db, 'test_collection'));
            dbStatus = true;
          } catch (err) {
            console.error("Firestore test failed:", err);
            // Even if the test fails, Firestore might still be initialized
            dbStatus = !!db;
          }
        }
        
        setFirebaseStatus({
          auth: authStatus,
          db: dbStatus
        });
      } catch (err) {
        console.error("Error checking Firebase status:", err);
      }
    };
    
    checkFirebase();
    
    // Load admin users
    const loadAdminUsers = async () => {
      if (db) {
        try {
          const adminCollection = collection(db, 'admins');
          const adminSnapshot = await getDocs(adminCollection);
          const adminList = adminSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAdminUsers(adminList);
        } catch (err) {
          console.error("Error loading admin users:", err);
        }
      }
    };
    
    loadAdminUsers();
  }, [loading, user, router, authUser]);

  const handleCreateAdmin = async () => {
    if (!userId.trim()) {
      setActionMessage({
        type: "error",
        message: "Vui lòng nhập User ID"
      });
      return;
    }
    
    try {
      await createAdminUser(userId);
      setActionMessage({
        type: "success",
        message: `Đã thêm người dùng ${userId} làm admin thành công`
      });
      
      // Refresh admin users list
      const adminCollection = collection(db!, 'admins');
      const adminSnapshot = await getDocs(adminCollection);
      const adminList = adminSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdminUsers(adminList);
      
      // Clear input
      setUserId("");
    } catch (err: any) {
      setActionMessage({
        type: "error",
        message: `Lỗi: ${err.message || "Không thể tạo admin"}`
      });
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (loading) {
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
        <title>Admin Debug - Development Only</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <AdminLayout title="Admin Debug (Development Only)">
        <div className="space-y-6">
          <Alert variant="warning">
            <AlertTitle>Chỉ dành cho môi trường phát triển</AlertTitle>
            <AlertDescription>
              Trang này chỉ hiển thị trong môi trường phát triển và sẽ bị ẩn trong môi trường sản xuất.
            </AlertDescription>
          </Alert>

          {actionMessage && (
            <Alert variant={actionMessage.type === "success" ? "default" : "destructive"}>
              <AlertDescription>{actionMessage.message}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái Firebase</CardTitle>
              <CardDescription>
                Kiểm tra trạng thái kết nối Firebase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Authentication:</span>
                  <span className={`font-medium ${firebaseStatus.auth ? 'text-green-500' : 'text-red-500'}`}>
                    {firebaseStatus.auth ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Firestore Database:</span>
                  <span className={`font-medium ${firebaseStatus.db ? 'text-green-500' : 'text-red-500'}`}>
                    {firebaseStatus.db ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current User:</span>
                  <span className="font-medium">{authUser?.email || 'Not signed in'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User ID:</span>
                  <span className="font-mono text-xs">{authUser?.uid || 'N/A'}</span>
                </div>
                {authUser && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium">Để tạo tài khoản admin cho người dùng hiện tại:</p>
                    <Button 
                      className="mt-2" 
                      variant="outline"
                      onClick={() => {
                        setUserId(authUser.uid);
                      }}
                    >
                      Sử dụng ID hiện tại
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quản lý Admin</CardTitle>
              <CardDescription>
                Thêm người dùng vào danh sách admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">
                    User ID
                  </label>
                  <Input
                    placeholder="Nhập User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateAdmin}>
                  Thêm Admin
                </Button>
              </div>

              <Separator className="my-6" />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Danh sách Admin hiện tại</h3>
                {adminUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có admin nào</p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminUsers.map((admin) => (
                          <tr key={admin.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                              {admin.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {admin.role || 'admin'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t text-xs text-gray-500">
              Lưu ý: Chỉ sử dụng công cụ này trong môi trường phát triển
            </CardFooter>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}