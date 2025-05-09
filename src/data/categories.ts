import { List, Coffee, GlassWater, Beef, Drumstick, Star, LayoutGrid } from "lucide-react";

export interface CategoryData {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  icon?: string;
}

// Sample categories data for initialization
export const sampleCategories: CategoryData[] = [
  { id: "all", name: "all", displayName: "Tất cả", displayOrder: 0 },
  { id: "special", name: "special", displayName: "Đặc biệt", displayOrder: 1 },
  { id: "main", name: "main", displayName: "Món chính", displayOrder: 2 },
  { id: "chicken", name: "chicken", displayName: "Gà ủ muối", displayOrder: 3 },
  { id: "chicken-feet", name: "chicken-feet", displayName: "Chân gà", displayOrder: 4 },
  { id: "drinks", name: "drinks", displayName: "Đồ uống", displayOrder: 5 },
];

// Map category IDs to icons for rendering
export const categoryIconMap = {
  all: <LayoutGrid size={20} className="text-gray-500" />,
  special: <Star size={20} className="text-purple-500" />,
  main: <Coffee size={20} className="text-orange-500" />,
  chicken: <Beef size={20} className="text-amber-500" />,
  "chicken-feet": <Drumstick size={20} className="text-red-500" />,
  drinks: <GlassWater size={20} className="text-blue-500" />,
};

// Function to get icon for a category
export const getCategoryIcon = (categoryId: string) => {
  return categoryIconMap[categoryId as keyof typeof categoryIconMap] || 
    <LayoutGrid size={20} className="text-gray-500" />;
};