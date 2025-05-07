import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";

export default function AdminIndexPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/admin/dashboard");
      } else {
        router.push("/auth/login?redirect=/admin/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>Admin - {siteConfig.name}</title>
        <meta name="description" content="Trang quản trị" />
      </Head>

      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </>
  );
}
