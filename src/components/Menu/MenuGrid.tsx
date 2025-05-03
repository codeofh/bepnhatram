import React from "react";
import { MenuItem } from "./MenuItem";
import { removeDiacritics } from "@/lib/utils";

interface MenuGridProps {
  items: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
  }[];
  activeCategory: string;
  searchQuery?: string;
}

export function MenuGrid({ items, activeCategory, searchQuery = "" }: MenuGridProps) {
  // Filter items by active category and search query
  const filteredItems = items
    .filter(item => {
      // Filter by category
      if (activeCategory && activeCategory !== "all") {
        if (item.category !== activeCategory) return false;
      }
      
      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const queryNoDiacritics = removeDiacritics(query);
        
        // Check if the query matches the original text or the text without diacritics
        const nameMatches = 
          item.name.toLowerCase().includes(query) || 
          removeDiacritics(item.name.toLowerCase()).includes(queryNoDiacritics);
          
        const descriptionMatches = 
          item.description.toLowerCase().includes(query) || 
          removeDiacritics(item.description.toLowerCase()).includes(queryNoDiacritics);
          
        return nameMatches || descriptionMatches;
      }
      
      return true;
    });

  return (
    <>
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuItem key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Không tìm thấy món ăn</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `Không tìm thấy món ăn nào phù hợp với từ khóa "${searchQuery}"`
              : "Không có món ăn nào trong danh mục này"}
          </p>
        </div>
      )}
    </>
  );
}
