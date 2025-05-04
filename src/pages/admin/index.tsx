import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoginForm } from "@/components/Admin/LoginForm";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { siteConfig } from "@/config/siteConfig";

export default function AdminLoginPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, loading, router]);

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
        <title>Đăng nhập - {siteConfig.name} Admin</title>
        <meta name="description" content="Trang đăng nhập quản trị" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <LoginForm />
      </div>
    </>
  );
}