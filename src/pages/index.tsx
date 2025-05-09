import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { MenuGrid } from "@/components/Menu/MenuGrid";
import { HeroSlider } from "@/components/Hero/HeroSlider";
import { LocationMap } from "@/components/Maps/LocationMap";
import { MenuItem, menuItems as staticMenuItems } from "@/data/menuItems";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { StructuredData } from "@/components/SEO/StructuredData";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { useMenuManagement } from "@/hooks/useMenuManagement";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import { isFirebaseInitialized } from "@/lib/firebase";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenuItems);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const hasAttemptedFetch = useRef(false);

  const { getAllMenuItems } = useMenuManagement();
  const { showError, showInfo } = useToastContext();
  const { settings, loading: settingsLoading } = useSettingsContext();

  // Use useCallback to prevent function recreation on each render
  const fetchMenuItems = useCallback(
    async (isRetry = false) => {
      if (isRetry) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }

      setError(null);
      try {
        setIsLoading(true);
        const result = await getAllMenuItems();

        if (result && Array.isArray(result.items) && result.items.length > 0) {
          setMenuItems(result.items);
          if (isRetry) {
            showInfo("Đã tải lại dữ liệu thực đơn thành công");
          }
        } else {
          // If no items were returned, fall back to static data
          console.log("No menu items found in Firebase, using static data");
          setMenuItems(staticMenuItems);
        }
      } catch (err: any) {
        console.error("Error fetching menu items:", err);
        // Set a more user-friendly error message based on the type of error
        if (err.code === "unavailable" || err.message?.includes("network")) {
          setError(
            "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.",
          );
        } else if (err.code === "permission-denied") {
          setError("Bạn không có quyền truy cập dữ liệu này.");
        } else {
          setError(
            `Không thể tải dữ liệu thực đơn: ${
              err.message || "Lỗi không xác định"
            }`,
          );
        }

        // Only show toast on first load or explicit retry
        if (!hasAttemptedFetch.current || isRetry) {
          showError("Không thể tải dữ liệu thực đơn, đang sử dụng dữ liệu mẫu");
        }
        // Fall back to static data on error
        setMenuItems(staticMenuItems);
      } finally {
        hasAttemptedFetch.current = true;
        setIsLoading(false);
        setIsRetrying(false);
      }
    },
    [getAllMenuItems, showError, showInfo],
  );

  // Retry function with exponential backoff
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchMenuItems(true);
  }, [fetchMenuItems]);

  // Only fetch on initial mount
  useEffect(() => {
    if (!hasAttemptedFetch.current) {
      fetchMenuItems();
    }
  }, [fetchMenuItems]);

  return (
    <>
      <SEO
        title={settings.seo.homePageTitle}
        description={settings.seo.defaultDescription}
      />
      <StructuredData type="restaurant" />

      <Layout
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      >
        <HeroSlider />

        <main className="flex-1 container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu thực đơn...</p>
            </div>
          ) : error ? (
            <div className="mb-6">
              <Alert
                variant={
                  error.includes("kết nối mạng") ? "warning" : "destructive"
                }
                className="mb-4"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
                <AlertDescription className="mt-2">
                  {error}
                  <div className="mt-4">
                    {isRetrying ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang thử lại...
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Thử lại
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Show menu items anyway, using static data */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm flex items-center mb-6">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Đang hiển thị dữ liệu thực đơn mẫu. Một số món ăn có thể không
                còn được phục vụ.
              </div>
            </div>
          ) : (
            <>
              {/* Menu Grid for Mobile - Full Width */}
              <div className="md:hidden w-full mb-6">
                <MenuGrid
                  items={menuItems}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar for desktop */}
                <div className="hidden md:block md:w-1/4">
                  <Sidebar
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                  />
                </div>

                {/* Menu content for desktop */}
                <div className="w-full md:w-3/4">
                  <div className="hidden md:block">
                    <MenuGrid
                      items={menuItems}
                      activeCategory={activeCategory}
                      searchQuery={searchQuery}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        <LocationMap />
      </Layout>
    </>
  );
}
