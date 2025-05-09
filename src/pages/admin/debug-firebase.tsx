import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Loader2, Save, AlertTriangle, Check, Database } from "lucide-react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";
import { db, auth, isFirebaseInitialized, storage } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getDoc, doc, setDoc, collection, getDocs } from "firebase/firestore";

export default function DebugFirebasePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [checkResults, setCheckResults] = useState<
    Record<string, boolean | string>
  >({});
  const [isChecking, setIsChecking] = useState(false);
  const [createdTestDoc, setCreatedTestDoc] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/admin/debug-firebase");
    }
  }, [user, authLoading, router]);

  const runFirebaseTests = async () => {
    setIsChecking(true);
    const results: Record<string, boolean | string> = {};

    try {
      // Check Firebase initialization
      results.firebaseInitialized = isFirebaseInitialized();

      // Check authentication
      results.authAvailable = !!auth;
      results.userAuthenticated = !!user;
      if (user) {
        results.userEmail = user.email || "No email";
        results.userId = user.uid;
      }

      // Check Firestore
      results.firestoreAvailable = !!db;

      if (db) {
        try {
          // Try to get a list of collections
          const settingsCollection = collection(db, "settings");
          const settingsQuery = await getDocs(settingsCollection);
          results.settingsCollectionReadable = true;
          results.settingsCount = settingsQuery.size.toString();

          // Try to read settings document
          try {
            const settingsDoc = await getDoc(
              doc(db, "settings", "site-settings"),
            );
            results.settingsDocExists = settingsDoc.exists();
            if (settingsDoc.exists()) {
              results.settingsData = "Data exists (not shown for security)";
            }
          } catch (error: any) {
            results.settingsReadError = `Error: ${error.code} - ${error.message}`;
          }

          // Try to write a test document
          try {
            await setDoc(doc(db, "settings", "test-document"), {
              test: true,
              timestamp: new Date(),
              createdBy: user?.uid || "anonymous",
            });
            results.testWriteSuccessful = true;
            setCreatedTestDoc(true);
          } catch (error: any) {
            results.testWriteError = `Error: ${error.code} - ${error.message}`;
          }
        } catch (error: any) {
          results.firestoreOperationError = `Error: ${error.code} - ${error.message}`;
        }
      }

      // Check Storage
      results.storageAvailable = !!storage;
    } catch (error: any) {
      results.generalError = `Error: ${error.message}`;
    } finally {
      setCheckResults(results);
      setIsChecking(false);
    }
  };

  const deleteTestDocument = async () => {
    if (!db) {
      showError("Firestore không khả dụng");
      return;
    }

    try {
      await setDoc(doc(db, "settings", "test-document"), {
        deleted: true,
        deletedAt: new Date(),
      });
      setCreatedTestDoc(false);
      showSuccess("Đã xóa tài liệu kiểm tra");
    } catch (error: any) {
      showError(`Không thể xóa tài liệu kiểm tra: ${error.message}`);
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
        <title>Kiểm tra Firebase - {siteConfig.name}</title>
        <meta name="description" content="Kiểm tra kết nối Firebase" />
      </Head>

      <AdminLayout title="Kiểm tra kết nối Firebase">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kiểm tra kết nối Firebase</CardTitle>
            <CardDescription>
              Công cụ này sẽ kiểm tra kết nối đến Firebase và quyền truy cập của
              bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runFirebaseTests}
              disabled={isChecking}
              className="mb-4"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Kiểm tra kết nối Firebase
                </>
              )}
            </Button>

            {Object.keys(checkResults).length > 0 && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Kết quả kiểm tra</h3>
                <div className="space-y-2">
                  {Object.entries(checkResults).map(([key, value]) => (
                    <div key={key} className="flex items-start">
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                        )
                      ) : (
                        <span className="h-5 w-5 mr-2 inline-block"></span>
                      )}
                      <div>
                        <span className="font-medium">{key}: </span>
                        <span>
                          {typeof value === "boolean"
                            ? value
                              ? "Thành công"
                              : "Thất bại"
                            : value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {createdTestDoc && (
              <div className="mt-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Tài liệu kiểm tra đã được tạo</AlertTitle>
                  <AlertDescription>
                    Một tài liệu kiểm tra đã được tạo trong bộ sưu tập
                    'settings'.
                    <div className="mt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteTestDocument}
                      >
                        Xóa tài liệu kiểm tra
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Kiểm tra này giúp xác định vấn đề với kết nối Firebase hoặc quyền
              truy cập. Nếu bạn gặp lỗi khi lưu cài đặt, hãy sử dụng công cụ này
              để kiểm tra.
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài liệu trợ giúp</CardTitle>
            <CardDescription>
              Một số lỗi thường gặp và cách khắc phục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-1">
                  Lỗi "permission-denied"
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bạn không có quyền truy cập để đọc/ghi dữ liệu. Kiểm tra quy
                  tắc bảo mật Firebase của bạn.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium mb-1">Lỗi "unavailable"</h3>
                <p className="text-sm text-muted-foreground">
                  Không thể kết nối đến máy chủ Firebase. Kiểm tra kết nối
                  internet của bạn hoặc tường lửa.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium mb-1">
                  Lỗi "invalid-argument"
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dữ liệu bạn đang cố gắng lưu có định dạng không hợp lệ. Kiểm
                  tra xem có giá trị undefined hoặc không hợp lệ không.
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium mb-1">
                  Lỗi "Firebase không được khởi tạo"
                </h3>
                <p className="text-sm text-muted-foreground">
                  Firebase chưa được khởi tạo đúng cách. Kiểm tra cấu hình
                  Firebase của bạn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
