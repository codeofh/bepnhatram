import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingCart, Search, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/Auth/AuthDialog";
import { SearchModal } from "@/components/Search/SearchModal";
import { useToastContext } from "@/contexts/ToastContext";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  toggleSidebar?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export function Header({ toggleSidebar, searchQuery = "", setSearchQuery }: HeaderProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const router = useRouter();
  const { showInfo } = useToastContext();
  const isBlogPage = router.pathname.startsWith('/blog');
  const isHomePage = router.pathname === "/";
  const isAboutPage = router.pathname === "/about" || router.pathname.startsWith('/about/');
  const isContactPage = router.pathname === "/contact" || router.pathname.startsWith('/contact/');

  // Function to determine nav link classes based on active state
  const getNavLinkClasses = (isActive: boolean) => {
    return `font-medium ${
      isActive 
        ? "text-blue-600 font-semibold" 
        : "text-gray-600 hover:text-blue-600"
    } transition-colors`;
  };

  // Function to show development notification
  const showDevelopmentNotification = () => {
    showInfo("Chức năng này đang được phát triển. Vui lòng quay lại sau!");
  };

  return (
    <header className="bg-white shadow-sm py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {!isBlogPage && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                onClick={toggleSidebar}
              >
                <Menu size={24} />
              </Button>
            )}
            <Link href="/" className="flex items-center">
              <Image
                src="logo-removebg.png"
                alt="BẾP NHÀ TRÂM"
                width={180}
                height={60}
                className="h-12 w-auto"
                style={{ objectFit: 'contain', background: 'transparent' }}
                priority
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isBlogPage && (
              <Link href="/" className={getNavLinkClasses(isHomePage)}>
                Món ăn
              </Link>
            )}
            <Link href="/about" className={getNavLinkClasses(isAboutPage)}>
              Giới thiệu
            </Link>
            <Link href="/contact" className={getNavLinkClasses(isContactPage)}>
              Liên hệ
            </Link>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {!isBlogPage && (
              <>
                {/* Desktop search - always visible on desktop */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Tìm kiếm món ăn..."
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  {searchQuery && (
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchQuery && setSearchQuery("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Mobile search button - only on homepage */}
                {isHomePage && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden" 
                    onClick={() => setSearchModalOpen(true)}
                  >
                    <Search size={24} />
                  </Button>
                )}

                {/* Mobile search modal - only on homepage */}
                {isHomePage && setSearchQuery && (
                  <SearchModal 
                    isOpen={searchModalOpen}
                    onClose={() => setSearchModalOpen(false)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                )}

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={showDevelopmentNotification}
                >
                  <ShoppingCart size={24} />
                </Button>
              </>
            )}

            <Button variant="ghost" size="icon" onClick={() => setAuthDialogOpen(true)}>
              <User size={24} />
            </Button>

            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}