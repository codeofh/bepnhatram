import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  List,
  Coffee,
  GlassWater,
  LayoutGrid,
  Beef,
  Drumstick,
  Star,
  Info,
  Phone,
  Home,
  FileText,
  Loader2,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryIconName } from "@/data/categories";

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  onClose?: () => void;
}

export function Sidebar({
  activeCategory,
  setActiveCategory,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const isAboutPage =
    router.pathname === "/about" || router.pathname.startsWith("/about/");
  const isContactPage =
    router.pathname === "/contact" || router.pathname.startsWith("/contact/");

  const { categories, loading: categoriesLoading } = useCategories();

  // Function to get navigation link classes based on active state
  const getNavLinkClasses = (isActive: boolean) => {
    return `w-full flex items-center p-3 rounded-md transition-colors ${
      isActive
        ? "bg-gray-100 text-blue-600 font-medium"
        : "text-gray-700 hover:bg-gray-50"
    }`;
  };

  // Function to render category icon based on category ID
  const renderCategoryIcon = (categoryId: string) => {
    const iconName = getCategoryIconName(categoryId);

    switch (iconName) {
      case "LayoutGrid":
        return <LayoutGrid size={20} className="text-gray-500" />;
      case "Star":
        return <Star size={20} className="text-purple-500" />;
      case "Coffee":
        return <Coffee size={20} className="text-orange-500" />;
      case "Beef":
        return <Beef size={20} className="text-amber-500" />;
      case "Drumstick":
        return <Drumstick size={20} className="text-red-500" />;
      case "GlassWater":
        return <GlassWater size={20} className="text-blue-500" />;
      default:
        return <LayoutGrid size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm">
      {isHomePage && (
        <>
          <div className="flex items-center mb-6 px-2">
            <List size={24} className="mr-2 text-gray-700" />
            <h2 className="text-xl font-bold">Danh mục</h2>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    activeCategory === category.id
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-3">
                    {renderCategoryIcon(category.id)}
                  </span>
                  <span>{category.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Navigation links */}
      <div
        className={`${isHomePage ? "md:hidden mt-6 pt-6 border-t border-gray-200" : ""}`}
      >
        {isHomePage && (
          <h3 className="text-sm font-medium text-gray-500 mb-3 px-3">Trang</h3>
        )}

        <Link
          href="/"
          className={getNavLinkClasses(isHomePage)}
          onClick={onClose}
        >
          <span className="mr-3">
            <Coffee size={20} className="text-gray-500" />
          </span>
          <span>Món ăn</span>
        </Link>

        <Link
          href="/about"
          className={getNavLinkClasses(isAboutPage)}
          onClick={onClose}
        >
          <span className="mr-3">
            <Info size={20} className="text-gray-500" />
          </span>
          <span>Giới thiệu</span>
        </Link>

        <Link
          href="/contact"
          className={getNavLinkClasses(isContactPage)}
          onClick={onClose}
        >
          <span className="mr-3">
            <Phone size={20} className="text-gray-500" />
          </span>
          <span>Liên hệ</span>
        </Link>
      </div>
    </div>
  );
}
