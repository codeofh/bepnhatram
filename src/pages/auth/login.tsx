import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoginForm } from "@/components/Admin/LoginForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { siteConfig } from "@/config/siteConfig";
import { SiteSettings, getSiteSettings } from "@/lib/firebaseSettings";

export default function AuthLoginPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { redirect } = router.query;
  const redirectPath =
    typeof redirect === "string" ? redirect : "/admin/dashboard";
  const [settings, setSettings] = useState<SiteSettings>(siteConfig);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Load settings from Firebase
  useEffect(() => {
    async function loadSettings() {
      try {
        const { settings: firebaseSettings } = await getSiteSettings();
        console.log("Loaded settings from Firebase:", firebaseSettings.name);
        setSettings(firebaseSettings);
      } catch (err) {
        console.error("Error loading settings from Firebase:", err);
        // Fall back to default settings
        setSettings(siteConfig);
      } finally {
        setSettingsLoading(false);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  if (loading || settingsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Đăng nhập - {settings.name}</title>
        <meta
          name="description"
          content={`Đăng nhập vào trang quản trị ${settings.name}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <LoginForm siteSettings={settings} />
      </div>
    </>
  );
}
