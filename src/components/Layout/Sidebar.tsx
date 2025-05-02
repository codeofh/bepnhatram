
import React from "react";
import { List, Apple, Coffee, Heart, GlassWater } from "lucide-react";

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function Sidebar({ activeCategory, setActiveCategory }: SidebarProps) {
  const categories = [
    { id: "appetizer", name: "Món khai vị", icon: <Apple size={20} /> },
    { id: "main", name: "Món chính", icon: <Coffee size={20} /> },
    { id: "dessert", name: "Món tráng miệng", icon: <Heart size={20} /> },
    { id: "drinks", name: "Đồ uống", icon: <GlassWater size={20} /> },
  ];

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-6 px-2">
        <List size={24} className="mr-2" />
        <h2 className="text-xl font-bold">Danh mục</h2>
      </div>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`w-full flex items-center p-3 rounded-md transition-colors ${
              activeCategory === category.id
                ? "bg-gray-100 text-black font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="mr-3">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
