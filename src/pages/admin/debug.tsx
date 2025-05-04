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
import { 
  getDoc, 
  doc, 
  collection, 
  getDocs, 
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToastContext } from "@/contexts/ToastContext";

export default function AdminDebugPage() {
  const { user, loading, error, createAdminUser, isUserAdmin } = useAdminAuth();
  const { user: authUser } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [userId, setUserId] = useState("");
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<{db: boolean, auth: boolean}>({
    db: false,
    auth: false
  });
  const [actionMessage, setActionMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !authUser && router.pathname !== '/admin') {
      router.push('/admin');
    }
    
    // Check Firebase status
    const checkFirebase = async () => {
      try {
        const authStatus = !!authUser;
        
        let dbStatus = false;
        if (db) {
          try {
            // Try to create a test document to verify write access
            const testDocRef = doc(db, 'test_collection', 'test_document');
            await setDoc(testDocRef, { 
              timestamp: new Date(),
              message: 'Test document for Firebase verification'
            });
            
            // Delete the test document right away
            await deleteDoc(testDocRef);
            
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
    
    // Check if current user is admin
    const checkCurrentUser = async () => {
      if (authUser && isUserAdmin) {
        const isAdmin = await isUserAdmin(authUser.uid);
        setCurrentUserIsAdmin(isAdmin);
      }
    };
    
    checkCurrentUser();
    
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
  }, [loading, authUser, router, isUserAdmin, refreshTrigger]);

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
      
      // Check if the current user is now an admin
      if (authUser && userId === authUser.uid) {
        setCurrentUserIsAdmin(true);
      }
      
      // Refresh admin users list
      setRefreshTrigger(prev => prev + 1);
      
      // Clear input
      setUserId("");
    } catch (err: any) {
      setActionMessage({
        type: "error",
        message: `Lỗi: ${err.message || "Không thể tạo admin"}`
      });
    }
  };

  const forceCreateAdmin = async () => {
    if (!authUser) {
      showError("Bạn cần đăng nhập trước");
      return;
    }
    
    try {
      if (!db) throw new Error("Firestore không được khởi tạo");
      
      // Create admin document directly
      const adminRef = doc(db, 'admins', authUser.uid);
      await setDoc(adminRef, {
        isAdmin: true,
        createdAt: new Date(),
        role: 'admin',
        note: 'Force created admin through debug page'
      });
      
      showSuccess("Đã cấp quyền admin cho tài khoản của bạn!");
      setCurrentUserIsAdmin(true);
      setRefreshTrigger(prev => prev + 1);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error("Error force creating admin:", err);
      showError(`Lỗi: ${err.message || "Không thể tạo admin"}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Debug - Bếp Nhà Trâm</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <span className="text-xl font-bold">
                  BẾP NHÀ TRÂM - Debug
                </span>
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Debug</h1>
          </div>
          
          <div className="space-y-6">
            <Alert variant="warning">
              <AlertTitle>Trang công cụ quản trị</AlertTitle>
              <AlertDescription>
                Trang này để quản lý quyền admin và khắc phục sự cố với tài khoản.
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
                  <div className="flex items-center justify-between mt-2">
                    <span>Admin Status:</span>
                    <span className={`font-medium ${currentUserIsAdmin ? 'text-green-500' : 'text-red-500'}`}>
                      {currentUserIsAdmin ? 'Is Admin' : 'Not Admin'}
                    </span>
                  </div>
                </div>
                
                {authUser && !currentUserIsAdmin && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Không có quyền admin?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Bạn có thể tự cấp quyền admin cho tài khoản hiện tại để truy cập trang quản trị
                    </p>
                    <Button 
                      onClick={forceCreateAdmin}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Tự cấp quyền Admin
                    </Button>
                  </div>
                )}
                
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {adminUsers.map((admin) => (
                            <tr key={admin.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                                {admin.id}
                                {authUser && admin.id === authUser.uid && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    You
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {admin.role || 'admin'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {admin.createdAt?.toDate?.() 
                                  ? admin.createdAt.toDate().toLocaleString() 
                                  : 'Unknown'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Để truy cập admin, tạo tài khoản admin trước
                </span>
                {currentUserIsAdmin && (
                  <Button 
                    onClick={() => router.push('/admin/dashboard')}
                    variant="default"
                  >
                    Đi đến trang quản trị
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}