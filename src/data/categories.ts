export interface CategoryData {
  id: string;
  name: string;
  displayName: string;
  displayOrder: number;
  icon?: string;
}

// Sample categories data for initialization
export const sampleCategories: CategoryData[] = [
  {
    id: "all",
    name: "all",
    displayName: "Tất cả",
    displayOrder: 0,
    icon: "LayoutGrid",
  },
  {
    id: "special",
    name: "special",
    displayName: "Đặc biệt",
    displayOrder: 1,
    icon: "Star",
  },
  {
    id: "main",
    name: "main",
    displayName: "Món chính",
    displayOrder: 2,
    icon: "Coffee",
  },
  {
    id: "chicken",
    name: "chicken",
    displayName: "Gà ủ muối",
    displayOrder: 3,
    icon: "Beef",
  },
  {
    id: "chicken-feet",
    name: "chicken-feet",
    displayName: "Chân gà",
    displayOrder: 4,
    icon: "Drumstick",
  },
  {
    id: "drinks",
    name: "drinks",
    displayName: "Đồ uống",
    displayOrder: 5,
    icon: "GlassWater",
  },
];

// Map of category icon names to help with rendering
export const categoryIconNames: Record<string, string> = {
  all: "LayoutGrid",
  special: "Star",
  main: "Coffee",
  chicken: "Beef",
  "chicken-feet": "Drumstick",
  drinks: "GlassWater",
};

// Function to get icon name for a category
export const getCategoryIconName = (categoryId: string): string => {
  return categoryIconNames[categoryId] || "LayoutGrid";
};
