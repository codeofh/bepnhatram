import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function AdminBreadcrumb({ items = [] }: AdminBreadcrumbProps) {
  const router = useRouter();

  // Generate breadcrumb items from the current path if none provided
  const breadcrumbs =
    items.length > 0 ? items : generateBreadcrumbs(router.pathname);

  return (
    <nav className="flex items-center space-x-1 text-sm mb-4 text-gray-500">
      <Link
        href="/admin/dashboard"
        className="flex items-center hover:text-gray-900"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Helper function to generate breadcrumbs from a pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split("/").filter(Boolean);

  // Remove 'admin' from the beginning
  if (paths[0] === "admin") {
    paths.shift();
  }

  if (paths.length === 0) {
    return [{ label: "Dashboard" }];
  }

  // Map pathname segments to readable names
  const pathMap: Record<string, string> = {
    dashboard: "Dashboard",
    orders: "Đơn hàng",
    menu: "Thực đơn",
    categories: "Danh mục",
    users: "Khách hàng",
    settings: "Cài đặt",
    debug: "Debug",
    sliders: "Slider",
    "media-library": "Thư viện",
  };

  // Generate breadcrumb items
  return paths.map((path, index) => {
    // Extract any ID parameters (e.g., [id])
    const isIdParam = path.includes("[") && path.includes("]");

    // Create the href for each breadcrumb
    const href =
      index < paths.length - 1
        ? `/admin/${paths.slice(0, index + 1).join("/")}`
        : undefined;

    // Get the label
    let label = pathMap[path] || path;

    // If it's an ID parameter, try to make it look better
    if (isIdParam) {
      label = "Chi tiết";
    }

    return {
      label,
      href,
    };
  });
}
