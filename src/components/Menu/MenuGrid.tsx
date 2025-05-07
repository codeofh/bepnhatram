import React, { useState } from "react";
import { MenuItem } from "./MenuItem";
import { removeDiacritics } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MenuGridProps {
  items: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    displayOrder?: number;
  }[];
  activeCategory: string;
  searchQuery?: string;
}

export function MenuGrid({
  items,
  activeCategory,
  searchQuery = "",
}: MenuGridProps) {
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items by active category and search query
  const filteredItems = items
    .filter((item) => {
      // Filter by category
      if (activeCategory && activeCategory !== "all") {
        if (item.category !== activeCategory) return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const queryNoDiacritics = removeDiacritics(query);

        const nameMatches =
          item.name.toLowerCase().includes(query) ||
          removeDiacritics(item.name.toLowerCase()).includes(queryNoDiacritics);

        const descriptionMatches =
          item.description.toLowerCase().includes(query) ||
          removeDiacritics(item.description.toLowerCase()).includes(
            queryNoDiacritics,
          );

        return nameMatches || descriptionMatches;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder;
      }
      if (a.displayOrder !== undefined) return -1;
      if (b.displayOrder !== undefined) return 1;
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Reset to first page when category or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              aria-disabled={currentPage === 1}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Trước</span>
            </PaginationPrevious>
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(i + 1);
                }}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              aria-disabled={currentPage === totalPages}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            >
              <span>Tiếp</span>
              <ChevronRight className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <>
      {/* Menu Grid */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedItems.map((item) => (
            <MenuItem key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Không tìm thấy món ăn
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? `Không tìm thấy món ăn nào phù hợp với từ khóa "${searchQuery}"`
              : "Không có món ăn nào trong danh mục này"}
          </p>
        </div>
      )}

      {/* Bottom Pagination for all screen sizes */}
      {filteredItems.length > 0 && (
        <div className="mt-8">{renderPagination()}</div>
      )}
    </>
  );
}
