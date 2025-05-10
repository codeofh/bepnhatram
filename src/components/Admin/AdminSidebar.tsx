import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Users,
  ImageIcon,
  AlignLeft,
  Tag,
  Home,
  Menu,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileText,
  Database,
  BarChart2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
  external?: boolean;
}

export function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = router.pathname;

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Đơn hàng",
      href: "/admin/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: "Thực đơn",
      href: "#",
      icon: <FileText className="h-5 w-5" />,
      submenu: [
        {
          title: "Danh mục",
          href: "/admin/categories",
          icon: <Tag className="h-4 w-4" />,
        },
        {
          title: "Món ăn",
          href: "/admin/menu",
          icon: <AlignLeft className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Khách hàng",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Thư viện",
      href: "/admin/media-library",
      icon: <ImageIcon className="h-5 w-5" />,
    },
    {
      title: "Slider",
      href: "/admin/sliders",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: "Cài đặt",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Về trang chủ",
      href: "/",
      icon: <Home className="h-5 w-5" />,
      external: true,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-auto lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link href="/admin/dashboard" className="font-bold text-lg">
            Admin Panel
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="px-3 py-4">
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = item.submenu
                  ? item.submenu.some((subitem) => pathname === subitem.href)
                  : pathname === item.href;

                if (item.submenu) {
                  return (
                    <Collapsible key={index} defaultOpen={isActive}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between",
                            isActive
                              ? "bg-gray-100 text-gray-900 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                          )}
                        >
                          <span className="flex items-center">
                            {item.icon}
                            <span className="ml-3 text-sm">{item.title}</span>
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-10 my-1 space-y-1">
                        {item.submenu.map((subitem, subindex) => {
                          const isSubActive = pathname === subitem.href;
                          return (
                            <Button
                              key={subindex}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-9",
                                isSubActive
                                  ? "bg-gray-100 text-gray-900 font-medium"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                              )}
                              asChild
                            >
                              <Link href={subitem.href}>
                                <span className="flex items-center">
                                  {subitem.icon}
                                  <span className="ml-3 text-sm">
                                    {subitem.title}
                                  </span>
                                </span>
                              </Link>
                            </Button>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                    asChild
                  >
                    <Link
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center"
                    >
                      {item.icon}
                      <span className="ml-3 text-sm">{item.title}</span>
                      {item.external && (
                        <ExternalLink className="h-3 w-3 ml-2" />
                      )}
                    </Link>
                  </Button>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Debug Tools
                </h3>
                <div className="mt-2 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    asChild
                  >
                    <Link href="/admin/debug">
                      <Database className="h-5 w-5" />
                      <span className="ml-3 text-sm">Firebase Debug</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
