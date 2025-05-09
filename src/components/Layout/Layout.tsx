import React, { useState } from "react";
import { useRouter } from "next/router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { SiteSettings } from "@/lib/firebaseSettings";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

interface LayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
  siteSettings?: SiteSettings;
}

export function Layout({
  children,
  searchQuery,
  setSearchQuery,
  activeCategory = "all",
  setActiveCategory,
  siteSettings = defaultSiteConfig,
}: LayoutProps) {
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [localActiveCategory, setLocalActiveCategory] = useState("all");

  // Use either the provided setActiveCategory or the local one
  const handleCategoryChange = (category: string) => {
    if (setActiveCategory) {
      setActiveCategory(category);
    } else {
      setLocalActiveCategory(category);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        toggleSidebar={toggleSidebar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchModalOpen={isSearchModalOpen}
        setIsSearchModalOpen={setIsSearchModalOpen}
        siteSettings={siteSettings}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      >
        <div
          className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-white overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <Sidebar
              activeCategory={
                setActiveCategory ? activeCategory : localActiveCategory
              }
              setActiveCategory={handleCategoryChange}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      </div>

      {children}

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
