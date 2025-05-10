import React, { useState, useEffect } from "react";
import { MenuItem } from "@/components/Menu/MenuItem";
import { MenuItem as MenuItemType } from "@/data/menuItems";
import {
  Search,
  ChefHat,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MenuGridProps {
  items: MenuItemType[];
  activeCategory: string;
  searchQuery: string;
}

export function MenuGrid({
  items,
  activeCategory,
  searchQuery,
}: MenuGridProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid on large screens

  // Filter items based on category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || activeCategory === item.category;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort items by displayOrder if available or id
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
      return a.displayOrder - b.displayOrder;
    }
    return a.id.localeCompare(b.id);
  });

  // Calculate total pages
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  // Get current items
  const currentItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the grid
    window.scrollTo({
      top: document.getElementById("menu-grid")?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  // EmptyState component for when no items match filters
  const EmptyState = () => (
    <div className="col-span-full py-12 text-center">
      {searchQuery ? (
        <div className="space-y-3">
          <Search className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="text-lg font-medium">Không tìm thấy món ăn</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Không tìm thấy món ăn nào phù hợp với từ khóa "{searchQuery}"
            {activeCategory !== "all" && " trong danh mục này"}.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Xem tất cả món ăn
          </Button>
        </div>
      ) : activeCategory !== "all" ? (
        <div className="space-y-3">
          <Filter className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="text-lg font-medium">Danh mục trống</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Hiện chưa có món ăn nào trong danh mục này.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <ChefHat className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="text-lg font-medium">Ch��a có món ăn nào</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Hiện tại chưa có món ăn nào được thêm vào thực đơn.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div id="menu-grid">
      {/* Toast notification container for cart actions */}
      <Toaster />
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => <MenuItem key={item.id} item={item} />)
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Pagination */}
      {sortedItems.length > itemsPerPage && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* First page */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis for many pages */}
              {currentPage > 4 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Page before current */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Current page */}
              <PaginationItem>
                <PaginationLink
                  isActive
                  onClick={() => handlePageChange(currentPage)}
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>

              {/* Page after current */}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis for many pages */}
              {currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
