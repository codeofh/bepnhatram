
import React from "react";
import { MenuItem } from "./MenuItem";

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
}

export function MenuGrid({ items, activeCategory }: MenuGridProps) {
  // Filter items by active category, or show all if activeCategory is empty
  const filteredItems = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <MenuItem key={item.id} {...item} />
      ))}
    </div>
  );
}
