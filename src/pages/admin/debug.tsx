import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import { siteConfig } from "@/config/siteConfig";

export default function AdminDebugPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

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
        <title>Debug - {siteConfig.name} Admin</title>
        <meta name="description" content="Trang debug" />
      </Head>

      <AdminLayout title="Debug">
        <Card>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Current User:</span>
                <span className="font-medium">
                  {user?.email || "Not signed in"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>User ID:</span>
                <span className="font-mono text-xs">{user?.uid || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
