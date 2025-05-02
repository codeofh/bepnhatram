import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/Auth/AuthDialog";

interface HeaderProps {
  toggleSidebar?: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const router = useRouter();
  const isBlogPage = router.pathname.startsWith('/blog');

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
                src="https://cdn.builder.io/api/v1/image/assets%2F08480922145a4de68226bc177e3fa5b5%2F6a081c8bbb874ebdb92771553778867f"
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
              <Link href="/" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Món ăn
              </Link>
            )}
            <Link href="/about" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Giới thiệu
            </Link>
            <Link href="/contact" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {!isBlogPage && (
              <>
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Tìm kiếm món ăn..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <Button variant="ghost" size="icon">
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