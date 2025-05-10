import React, { ReactNode, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { ArrowLeft, LogOut, User, Bell, Settings, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/contexts/AuthContext";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  backHref?: string;
}

export function AdminLayout({
  children,
  title = "Admin Dashboard",
  backHref,
}: AdminLayoutProps) {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user || !user.displayName) return "?";

    const nameParts = user.displayName.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      } else {
        console.error("Auth is not initialized");
      }
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex h-16 items-center px-4 md:px-6 gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 flex items-center">
              {backHref && (
                <Button variant="ghost" size="icon" asChild className="mr-2">
                  <Link href={backHref}>
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <h1 className="font-semibold text-lg">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="items-center gap-2 hidden md:flex">
                <span className="text-sm text-gray-600">
                  {user?.displayName || "Admin User"}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.photoURL || undefined}
                        alt={user?.displayName || "Admin User"}
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <main className="flex-1 container mx-auto py-6 px-4 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
