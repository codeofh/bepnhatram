import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoginForm } from "@/components/Admin/LoginForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";

export default function AuthLoginPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { redirect } = router.query;
  const redirectPath = typeof redirect === "string" ? redirect : "/admin/dashboard";

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

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
        <title>Đăng nhập - {siteConfig.name}</title>
        <meta name="description" content="Trang đăng nhập" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <LoginForm />
      </div>
    </>
  );
}