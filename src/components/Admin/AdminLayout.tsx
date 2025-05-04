import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Lock,
  Globe
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/siteConfig";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/admin');
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user || !user.displayName) return '?';

    const nameParts = user.displayName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Menu",
      path: "/admin/menu",
      icon: <UtensilsCrossed size={20} />,
    },
    {
      name: "Danh mục",
      path: "/admin/categories",
      icon: <Tags size={20} />,
    },
    {
      name: "Người dùng",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Cài đặt",
      path: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden mr-2">
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <Link href="/" className="flex items-center">
                    <span className="text-lg font-bold">
                      {siteConfig.name} - Admin
                    </span>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X size={18} />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col p-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center p-3 mb-1 rounded-md hover:bg-gray-100 ${isActive(item.path)
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                          }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    </SheetClose>
                  ))}
                  <Button
                    variant="ghost"
                    className="flex items-center p-3 mb-1 rounded-md hover:bg-gray-100 justify-start font-normal"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Đăng xuất</span>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold hidden md:inline-block">
                {siteConfig.name} - Admin
              </span>
              <span className="text-xl font-bold md:hidden">
                BNT Admin
              </span>
            </Link>
          </div>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-green-600 text-white">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="mr-1 hidden sm:inline-block">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/account/settings" passHref>
                  <DropdownMenuItem>
                    <Lock className="mr-2 h-4 w-4" />
                    Đổi mật khẩu
                  </DropdownMenuItem>
                </Link>
                <Link href="/" passHref>
                  <DropdownMenuItem>
                    <Globe className="mr-2 h-4 w-4" />
                    Xem trang web
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Main container */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="w-64 border-r border-gray-200 bg-white hidden lg:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center p-3 rounded-md hover:bg-gray-100 ${isActive(item.path)
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700"
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full justify-start font-normal"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              <span>Đăng xuất</span>
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}