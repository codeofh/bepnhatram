import { MenuItem, SizeOption } from "./menuItems";

// Sample menu items data for initialization
export const sampleMenuItems: MenuItem[] = [
  // Món đặc biệt
  {
    id: "special-01",
    name: "Nghêu Trộn xốt Thái",
    description: "Nghêu trộn với xốt Thái đặc biệt, chua ngọt hài hòa",
    price: 65000,
    image:
      "https://images.unsplash.com/photo-1576020799627-aeac74d58064?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "special",
    rating: 4,
    displayOrder: 5,
    sizes: [
      { name: "Nhỏ", price: 50000 },
      { name: "Lớn", price: 65000 },
    ],
  },
  {
    id: "special-02",
    name: "Nghêu Trộn xốt Thái Phần Nhỏ",
    description: "Ngh��u Trộn xốt Thái phần nhỏ dành cho 1-2 người",
    price: 50000,
    image:
      "https://images.unsplash.com/photo-1576020799627-aeac74d58064?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "special",
    rating: 4,
    displayOrder: 6,
  },
  {
    id: "special-03",
    name: "Chai xốt thần thánh",
    description:
      "Chai xốt thần thánh\nChai 330ml: chấm gà, hải sản, chấm cả thế giới",
    price: 55000,
    image:
      "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "special",
    rating: 4,
    displayOrder: 7,
  },
  // Món chính
  {
    id: "main-01",
    name: "Bò lúc lắc khoai tây",
    description:
      "Thịt bò thăn mềm được xào cùng với khoai tây và các loại rau củ",
    price: 145000,
    image:
      "https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 4,
    displayOrder: 10,
  },
  {
    id: "main-02",
    name: "Cá hồi áp chảo",
    description: "Cá hồi tươi áp chảo với sốt chanh và rau thơm",
    price: 165000,
    image:
      "https://images.unsplash.com/photo-1485921325833-c519f76c4927?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 5,
    displayOrder: 20,
  },
  {
    id: "main-03",
    name: "Xôi gà xé trộn",
    description: "Xôi dẻo với gà xé phay và gia vị đặc biệt",
    price: 65000,
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 4,
    displayOrder: 30,
  },
  {
    id: "main-04",
    name: "Xôi hành phi",
    description: "Xôi trắng dẻo với hành phi thơm béo",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1546039907-7fa05f864c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 4,
    displayOrder: 40,
  },
  // Gà ủ muối
  {
    id: "chicken-01",
    name: "Gà ủ muối hoa tiêu 1/4 con",
    description: "Gà ủ muối, đu đủ, cà rốt, rau răm, sốt",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken",
    rating: 4,
    displayOrder: 210,
  },
  {
    id: "chicken-02",
    name: "Gà ủ muối",
    description: "Gà ủ muối, đu đủ, cà rốt, rau răm, s���t",
    price: 185000,
    image:
      "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken",
    rating: 4,
    displayOrder: 220,
    sizes: [
      { name: "1/4 con", price: 95000 },
      { name: "1/2 con", price: 185000 },
      { name: "1 con", price: 265000 },
    ],
  },
  // Chân gà
  {
    id: "chicken-feet-01",
    name: "Chân gà rút xương xốt Thái",
    description: "Chân gà rút xương xốt Thái chua ngọt đậm đà",
    price: 60000,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 310,
    sizes: [
      { name: "Nhỏ", price: 60000 },
      { name: "Lớn", price: 75000 },
    ],
  },
  {
    id: "chicken-feet-02",
    name: "Chân gà rút xương sả tắc lớn",
    description: "Chân gà rút xương sả tắc thơm ngon đậm vị",
    price: 75000,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 320,
  },
  // Đồ uống
  {
    id: "drinks-01",
    name: "Coca",
    description: "Nước ngọt Coca-Cola có gas mát lạnh",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 410,
  },
  {
    id: "drinks-02",
    name: "Sữa Chua",
    description: "Sữa chua tươi mát béo ngậy",
    price: 30000,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 420,
  },
  {
    id: "drinks-03",
    name: "Redbull",
    description: "Nước tăng lực Redbull",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1551870573-6f5e93e660fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 430,
  },
];
