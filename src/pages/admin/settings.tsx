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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 pb-16 md:pb-0">
              <div className="mb-5">
                <h2 className="text-base font-medium">Cài đặt trang web</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Quản lý cài đặt chung cho toàn bộ trang web
                </p>
              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-40 flex gap-3 md:hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 h-10 text-sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Mặc định</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 text-sm bg-black text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      <span>Lưu</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="hidden md:flex md:justify-between md:items-center md:mb-6">
                <div>
                  <h2 className="text-lg font-medium">Cài đặt trang web</h2>
                  <p className="text-sm text-muted-foreground">
                    Quản lý cài đặt chung cho toàn bộ trang web
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Khôi phục mặc định</span>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
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

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="overflow-x-auto mb-4 -mx-4 px-4">
                  <TabsList className="flex w-auto whitespace-nowrap">
                    <TabsTrigger
                      value="general"
                      className="px-3 py-1.5 text-xs"
                    >
                      Cài đặt chung
                    </TabsTrigger>
                    <TabsTrigger
                      value="contact"
                      className="px-3 py-1.5 text-xs"
                    >
                      Liên hệ
                    </TabsTrigger>
                    <TabsTrigger value="social" className="px-3 py-1.5 text-xs">
                      Mạng xã hội
                    </TabsTrigger>
                    <TabsTrigger
                      value="ordering"
                      className="px-3 py-1.5 text-xs"
                    >
                      Đặt hàng
                    </TabsTrigger>
                    <TabsTrigger value="maps" className="px-3 py-1.5 text-xs">
                      Bản đồ
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="px-3 py-1.5 text-xs">
                      SEO
                    </TabsTrigger>
                    <TabsTrigger value="other" className="px-3 py-1.5 text-xs">
                      Khác
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="general">
                  <Card className="rounded-lg border shadow-sm">
                    <CardHeader className="px-4 py-3 sm:px-5 sm:py-4">
                      <CardTitle className="text-base">
                        Thông tin cơ bản
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Cài đặt thông tin chung cho website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 pb-4 pt-0 sm:px-5 sm:pb-5 sm:pt-0">
                      <div className="grid gap-4">
                        <div className="grid gap-1.5 pb-1">
                          <Label htmlFor="name" className="text-sm">
                            Tên website
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleChange("name", "", e.target.value)
                            }
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="description">Mô tả</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              handleChange("description", "", e.target.value)
                            }
                            rows={3}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="url">URL trang web</Label>
                          <Input
                            id="url"
                            value={formData.url}
                            onChange={(e) =>
                              handleChange("url", "", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông tin liên hệ</CardTitle>
                      <CardDescription>
                        Cài đặt thông tin liên hệ của cửa hàng
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input
                            id="phone"
                            value={formData.contact?.phone || ""}
                            onChange={(e) =>
                              handleChange("contact", "phone", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.contact?.email || ""}
                            onChange={(e) =>
                              handleChange("contact", "email", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="address">Địa chỉ</Label>
                          <Input
                            id="address"
                            value={formData.contact?.address || ""}
                            onChange={(e) =>
                              handleChange("contact", "address", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="openingHours">Giờ mở cửa</Label>
                          <Input
                            id="openingHours"
                            value={formData.contact?.openingHours || ""}
                            onChange={(e) =>
                              handleChange(
                                "contact",
                                "openingHours",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="city">Thành phố</Label>
                            <Input
                              id="city"
                              value={formData.contact?.city || ""}
                              onChange={(e) =>
                                handleChange("contact", "city", e.target.value)
                              }
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="region">Khu vực</Label>
                            <Input
                              id="region"
                              value={formData.contact?.region || ""}
                              onChange={(e) =>
                                handleChange(
                                  "contact",
                                  "region",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="postalCode">Mã bưu chính</Label>
                            <Input
                              id="postalCode"
                              value={formData.contact?.postalCode || ""}
                              onChange={(e) =>
                                handleChange(
                                  "contact",
                                  "postalCode",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="countryCode">Mã quốc gia</Label>
                            <Input
                              id="countryCode"
                              value={formData.contact?.countryCode || ""}
                              onChange={(e) =>
                                handleChange(
                                  "contact",
                                  "countryCode",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="social">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mạng xã hội</CardTitle>
                      <CardDescription>
                        Cài đặt liên kết mạng xã hội
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={formData.social?.facebook || ""}
                            onChange={(e) =>
                              handleChange("social", "facebook", e.target.value)
                            }
                            placeholder="https://facebook.com/your-page"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="facebookHandle">Tên Facebook</Label>
                          <Input
                            id="facebookHandle"
                            value={formData.social?.facebookHandle || ""}
                            onChange={(e) =>
                              handleChange(
                                "social",
                                "facebookHandle",
                                e.target.value,
                              )
                            }
                            placeholder="fb.com/your-page"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            value={formData.social?.instagram || ""}
                            onChange={(e) =>
                              handleChange(
                                "social",
                                "instagram",
                                e.target.value,
                              )
                            }
                            placeholder="https://instagram.com/your-handle"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="tiktok">TikTok</Label>
                          <Input
                            id="tiktok"
                            value={formData.social?.tiktok || ""}
                            onChange={(e) =>
                              handleChange("social", "tiktok", e.target.value)
                            }
                            placeholder="https://tiktok.com/@your-handle"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="tiktokHandle">Tên TikTok</Label>
                          <Input
                            id="tiktokHandle"
                            value={formData.social?.tiktokHandle || ""}
                            onChange={(e) =>
                              handleChange(
                                "social",
                                "tiktokHandle",
                                e.target.value,
                              )
                            }
                            placeholder="@your-handle"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="zalo">Zalo</Label>
                          <Input
                            id="zalo"
                            value={formData.social?.zalo || ""}
                            onChange={(e) =>
                              handleChange("social", "zalo", e.target.value)
                            }
                            placeholder="https://zalo.me/your-number"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="messenger">Messenger</Label>
                          <Input
                            id="messenger"
                            value={formData.social?.messenger || ""}
                            onChange={(e) =>
                              handleChange(
                                "social",
                                "messenger",
                                e.target.value,
                              )
                            }
                            placeholder="https://m.me/your-page"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ordering">
                  <Card>
                    <CardHeader>
                      <CardTitle>Đặt hàng</CardTitle>
                      <CardDescription>
                        Cài đặt liên kết đặt hàng trên các nền tảng
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="shopeeFood">ShopeeFood</Label>
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
                            placeholder="https://shopeefood.vn/..."
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="grabFood">GrabFood</Label>
                          <Input
                            id="grabFood"
                            value={formData.ordering?.grabFood || ""}
                            onChange={(e) =>
                              handleChange(
                                "ordering",
                                "grabFood",
                                e.target.value,
                              )
                            }
                            placeholder="https://food.grab.com/..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="maps">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bản đồ</CardTitle>
                      <CardDescription>
                        Cài đặt thông tin bản đồ và vị trí
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="embedUrl">URL nhúng bản đồ</Label>
                          <Textarea
                            id="embedUrl"
                            value={formData.maps?.embedUrl || ""}
                            onChange={(e) =>
                              handleChange("maps", "embedUrl", e.target.value)
                            }
                            rows={3}
                            placeholder="https://www.google.com/maps/embed?..."
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="directionsUrl">URL chỉ đường</Label>
                          <Input
                            id="directionsUrl"
                            value={formData.maps?.directionsUrl || ""}
                            onChange={(e) =>
                              handleChange(
                                "maps",
                                "directionsUrl",
                                e.target.value,
                              )
                            }
                            placeholder="https://maps.app.goo.gl/..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="latitude">Vĩ độ</Label>
                            <Input
                              id="latitude"
                              value={formData.maps?.latitude || ""}
                              onChange={(e) =>
                                handleChange("maps", "latitude", e.target.value)
                              }
                              placeholder="16.462..."
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="longitude">Kinh độ</Label>
                            <Input
                              id="longitude"
                              value={formData.maps?.longitude || ""}
                              onChange={(e) =>
                                handleChange(
                                  "maps",
                                  "longitude",
                                  e.target.value,
                                )
                              }
                              placeholder="107.591..."
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo">
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO</CardTitle>
                      <CardDescription>
                        Cài đặt thông tin SEO cho trang web
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="titleTemplate">Mẫu tiêu đề</Label>
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
                            placeholder="%s - Tên trang web"
                          />
                          <p className="text-xs text-muted-foreground">
                            Sử dụng %s để đặt vị trí tiêu đề trang
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="defaultTitle">Tiêu đề mặc định</Label>
                          <Input
                            id="defaultTitle"
                            value={formData.seo?.defaultTitle || ""}
                            onChange={(e) =>
                              handleChange(
                                "seo",
                                "defaultTitle",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="defaultDescription">
                            Mô tả mặc định
                          </Label>
                          <Textarea
                            id="defaultDescription"
                            value={formData.seo?.defaultDescription || ""}
                            onChange={(e) =>
                              handleChange(
                                "seo",
                                "defaultDescription",
                                e.target.value,
                              )
                            }
                            rows={3}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="ogImageUrl">
                            URL hình ảnh chia sẻ
                          </Label>
                          <Input
                            id="ogImageUrl"
                            value={formData.seo?.ogImageUrl || ""}
                            onChange={(e) =>
                              handleChange("seo", "ogImageUrl", e.target.value)
                            }
                            placeholder="/logo.png"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="keywords">Từ khóa</Label>
                          <Textarea
                            id="keywords"
                            value={formData.seo?.keywords || ""}
                            onChange={(e) =>
                              handleChange("seo", "keywords", e.target.value)
                            }
                            rows={2}
                          />
                          <p className="text-xs text-muted-foreground">
                            Các từ khóa cách nhau bằng dấu phẩy
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="homePageTitle">
                            Tiêu đề trang chủ
                          </Label>
                          <Input
                            id="homePageTitle"
                            value={formData.seo?.homePageTitle || ""}
                            onChange={(e) =>
                              handleChange(
                                "seo",
                                "homePageTitle",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="other">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cài đặt khác</CardTitle>
                      <CardDescription>Các cài đặt bổ sung</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currency">Tiền tệ</Label>
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
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="currencySymbol">
                            Ký hiệu tiền tệ
                          </Label>
                          <Input
                            id="currencySymbol"
                            value={formData.settings?.currencySymbol || ""}
                            onChange={(e) =>
                              handleChange(
                                "settings",
                                "currencySymbol",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="locale">Ngôn ngữ</Label>
                          <Input
                            id="locale"
                            value={formData.settings?.locale || ""}
                            onChange={(e) =>
                              handleChange("settings", "locale", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-6 hidden md:block">
              <Card>
                <CardFooter className="flex justify-between gap-3 p-4 pt-3 sm:p-5">
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
                    className="h-10 text-sm"
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
                </CardFooter>
              </Card>
            </div>
          </form>
        )}
      </AdminLayout>
    </>
  );
}
