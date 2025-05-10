import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Loader2, Save, RefreshCw, AlertTriangle } from "lucide-react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";
import {
  SiteSettings,
  updateSiteSettings,
  getSiteSettings,
  resetSiteSettings,
} from "@/lib/firebaseSettings";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";
import { isFirebaseInitialized } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { showSuccess, showError } = useToastContext();

  const [settings, setSettings] = useState<SiteSettings>(defaultSiteConfig);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SiteSettings>(defaultSiteConfig);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Ensure nested objects exist in form data
  const ensureNestedObjects = (data: Partial<SiteSettings>): SiteSettings => {
    return {
      ...defaultSiteConfig,
      ...data,
      contact: {
        ...defaultSiteConfig.contact,
        ...(data.contact || {}),
      },
      social: {
        ...defaultSiteConfig.social,
        ...(data.social || {}),
      },
      ordering: {
        ...defaultSiteConfig.ordering,
        ...(data.ordering || {}),
      },
      maps: {
        ...defaultSiteConfig.maps,
        ...(data.maps || {}),
      },
      seo: {
        ...defaultSiteConfig.seo,
        ...(data.seo || {}),
      },
      settings: {
        ...defaultSiteConfig.settings,
        ...(data.settings || {}),
      },
    };
  };

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setSettingsLoading(true);
        const { settings: loadedSettings, error } = await getSiteSettings();

        if (error) {
          setSettingsError(error);
        } else {
          // Ensure all nested objects exist in the loaded settings
          const safeSettings = ensureNestedObjects(loadedSettings);

          setSettings(safeSettings);
          setFormData(safeSettings);
          setSettingsError(null);
        }
      } catch (err: any) {
        console.error("[AdminSettings] Error loading settings:", err);
        setSettingsError(err.message || "Không thể tải cài đặt");

        // On error, use default settings with all nested objects
        const safeSettings = ensureNestedObjects({});
        setSettings(safeSettings);
        setFormData(safeSettings);
      } finally {
        setSettingsLoading(false);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/admin/settings");
    }
  }, [user, authLoading, router]);

  const handleChange = (
    section: keyof SiteSettings,
    field: string,
    value: string,
  ) => {
    if (section === "name" || section === "description" || section === "url") {
      setFormData((prev) => ({
        ...prev,
        [section]: value,
      }));
    } else {
      setFormData((prev) => {
        // Create section if it doesn't exist
        const existingSection = prev[section] || {};

        return {
          ...prev,
          [section]: {
            ...existingSection,
            [field]: value,
          },
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Test Firebase connection
      if (typeof isFirebaseInitialized !== "function") {
        showError("Firebase initialization function is missing!");
        return;
      }

      if (!isFirebaseInitialized()) {
        showError("Firebase không được khởi tạo, không thể lưu cài đặt!");
        return;
      }

      // Call the updateSiteSettings function directly
      const { success, error } = await updateSiteSettings(formData);

      if (error) {
        setSettingsError(error);
      }

      if (success) {
        // Update local settings state if successful
        // Ensure all nested objects exist in the formData
        const safeFormData = ensureNestedObjects(formData);
        setSettings(safeFormData);
        setFormData(safeFormData);
        showSuccess("Cài đặt đã được cập nhật thành công!");
      } else {
        // Show a more specific error if available
        if (settingsError) {
          showError(settingsError);
        } else {
          showError("Không thể cập nhật cài đặt. Vui lòng thử lại.");
        }
      }
    } catch (error: any) {
      showError(
        `Đã xảy ra lỗi khi cập nhật cài đặt: ${error.message || "Lỗi không xác định"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn khôi phục về cài đặt mặc định? Thao tác này không thể hoàn tác.",
      )
    ) {
      try {
        const { success, error } = await resetSiteSettings();

        if (success) {
          // Make sure we have all nested objects
          const safeDefaultSettings = ensureNestedObjects(defaultSiteConfig);
          setFormData(safeDefaultSettings);
          setSettings(safeDefaultSettings);
          showSuccess("Đã khôi phục về cài đặt mặc định!");
        } else {
          // Show a more specific error if available
          if (error) {
            setSettingsError(error);
            showError(error);
          } else {
            showError(
              "Không thể khôi phục cài đặt mặc định. Vui lòng thử lại.",
            );
          }
        }
      } catch (error: any) {
        showError(
          `Đã xảy ra lỗi khi khôi phục cài đặt mặc định: ${error.message || "Lỗi không xác định"}`,
        );
      }
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
        <title>Cài đặt hệ thống - Admin</title>
        <meta name="description" content="Quản lý cài đặt hệ thống" />
      </Head>

      <AdminLayout title="Cài đặt hệ thống">
        <div className="max-w-full overflow-hidden px-0">
          {settingsLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải cài đặt...</span>
            </div>
          ) : settingsError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{settingsError}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left sidebar with navigation - similar to account page */}
              <div className="w-full lg:w-1/4 xl:w-1/5">
                <div className="bg-white rounded-lg border shadow-sm p-4 lg:p-5">
                  <div className="flex flex-col space-y-1 mb-5">
                    <h3 className="text-base font-semibold">
                      Cài đặt trang web
                    </h3>
                    <p className="text-xs text-gray-500">
                      Quản lý cài đặt chung cho toàn bộ trang web
                    </p>
                  </div>

                  <div className="flex lg:flex-col flex-wrap gap-2 lg:gap-0 pb-2 lg:pb-0">
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "general" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Cài đặt chung
                    </button>
                    <button
                      onClick={() => setActiveTab("contact")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "contact" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Liên hệ
                    </button>
                    <button
                      onClick={() => setActiveTab("social")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "social" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Mạng xã hội
                    </button>
                    <button
                      onClick={() => setActiveTab("ordering")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "ordering" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Đặt hàng
                    </button>
                    <button
                      onClick={() => setActiveTab("maps")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "maps" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Bản đồ
                    </button>
                    <button
                      onClick={() => setActiveTab("seo")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "seo" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      SEO
                    </button>
                    <button
                      onClick={() => setActiveTab("other")}
                      className={`px-3 py-2 text-sm rounded-md flex items-center lg:mb-1 ${activeTab === "other" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      Khác
                    </button>
                  </div>
                </div>
              </div>

              {/* Main content area - similar to account page */}
              <div className="w-full lg:w-3/4 xl:w-4/5">
                <div className="bg-white rounded-lg border shadow-sm mb-16 lg:mb-0">
                  <div className="border-b px-4 py-4 sm:px-6">
                    <h2 className="text-lg font-medium">
                      {activeTab === "general" && "Thông tin cơ bản"}
                      {activeTab === "contact" && "Thông tin liên hệ"}
                      {activeTab === "social" && "Mạng xã hội"}
                      {activeTab === "ordering" && "Đặt hàng"}
                      {activeTab === "maps" && "Bản đồ"}
                      {activeTab === "seo" && "SEO"}
                      {activeTab === "other" && "Cài đặt khác"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {activeTab === "general" &&
                        "Xem và cập nhật thông tin cơ bản cho website"}
                      {activeTab === "contact" &&
                        "Cài đặt thông tin liên hệ của cửa hàng"}
                      {activeTab === "social" && "Cài đặt liên kết mạng xã hội"}
                      {activeTab === "ordering" &&
                        "Cài đặt liên kết đặt hàng trên các nền tảng"}
                      {activeTab === "maps" &&
                        "Cài đặt thông tin bản đồ và vị trí"}
                      {activeTab === "seo" &&
                        "Cài đặt thông tin SEO cho trang web"}
                      {activeTab === "other" && "Các cài đặt bổ sung"}
                    </p>
                  </div>

                  <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="max-w-full">
                      <div className="space-y-5 overflow-hidden">
                        {activeTab === "general" && (
                          <div className="space-y-4">
                            <div className="grid gap-4 pb-1">
                              <div>
                                <Label
                                  htmlFor="name"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Tên website
                                </Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) =>
                                    handleChange("name", "", e.target.value)
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full max-w-full box-border"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="description"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Mô tả
                                </Label>
                                <Textarea
                                  id="description"
                                  value={formData.description}
                                  onChange={(e) =>
                                    handleChange(
                                      "description",
                                      "",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  className="text-sm p-3 border border-gray-200 rounded-md min-h-[80px] w-full max-w-full box-border resize-y"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="url"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  URL trang web
                                </Label>
                                <Input
                                  id="url"
                                  value={formData.url}
                                  onChange={(e) =>
                                    handleChange("url", "", e.target.value)
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "contact" && (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label
                                  htmlFor="phone"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Số điện thoại
                                </Label>
                                <Input
                                  id="phone"
                                  value={formData.contact?.phone || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "contact",
                                      "phone",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="email"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.contact?.email || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "contact",
                                      "email",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="address"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Địa chỉ
                                </Label>
                                <Input
                                  id="address"
                                  value={formData.contact?.address || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "contact",
                                      "address",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "social" && (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label
                                  htmlFor="facebook"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Facebook
                                </Label>
                                <Input
                                  id="facebook"
                                  value={formData.social?.facebook || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "social",
                                      "facebook",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                  placeholder="https://facebook.com/your-page"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "ordering" && (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label
                                  htmlFor="shopeeFood"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  ShopeeFood
                                </Label>
                                <Input
                                  id="shopeeFood"
                                  value={formData.ordering?.shopeeFood || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "ordering",
                                      "shopeeFood",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                  placeholder="https://shopeefood.vn/..."
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "maps" && (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label
                                  htmlFor="embedUrl"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  URL nhúng bản đồ
                                </Label>
                                <Textarea
                                  id="embedUrl"
                                  value={formData.maps?.embedUrl || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "maps",
                                      "embedUrl",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  className="text-sm p-3 border border-gray-200 rounded-md w-full"
                                  placeholder="https://www.google.com/maps/embed?..."
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "seo" && (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label
                                  htmlFor="titleTemplate"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Mẫu tiêu đề
                                </Label>
                                <Input
                                  id="titleTemplate"
                                  value={formData.seo?.titleTemplate || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "seo",
                                      "titleTemplate",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                  placeholder="%s - Tên trang web"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "other" && (
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label
                                  htmlFor="currency"
                                  className="text-sm font-medium block mb-1.5"
                                >
                                  Tiền tệ
                                </Label>
                                <Input
                                  id="currency"
                                  value={formData.settings?.currency || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      "settings",
                                      "currency",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 text-sm px-3 border border-gray-200 rounded-md w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6 border-t pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="h-10 text-sm"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Khôi phục mặc định</span>
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 text-sm bg-black text-white"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Đang lưu...</span>
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                <span>Lưu thay đổi</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
