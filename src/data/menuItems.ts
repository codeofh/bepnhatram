export interface SizeOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  displayOrder?: number;
  sizes?: SizeOption[];
}

export const menuItems: MenuItem[] = [
  // Món đặc biệt
  {
    id: "26",
    name: "Nghêu Trộn xốt Thái",
    description: "Nghêu Trộn xốt Thái",
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
    id: "28",
    name: "Nghêu Trộn xốt Thái Phần Nhỏ",
    description: "Nghêu Trộn xốt Thái Phần Nhỏ",
    price: 50000,
    image:
      "https://images.unsplash.com/photo-1576020799627-aeac74d58064?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "special",
    rating: 4,
    displayOrder: 6,
  },
  {
    id: "29",
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
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
    name: "Xôi hành phi",
    description: "Xôi trắng dẻo với hành phi thơm béo",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1546039907-7fa05f864c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 4,
    displayOrder: 40,
  },
  {
    id: "5",
    name: "Xôi hành phi đặc biệt",
    description: "Xôi trắng dẻo với hành phi thơm béo và thịt kho",
    price: 55000,
    image:
      "https://images.unsplash.com/photo-1546039907-7fa05f864c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 5,
    displayOrder: 50,
  },
  {
    id: "6",
    name: "Mì Ý sốt thịt băm",
    description: "Mì Ý với sốt thịt bò băm cà chua đậm đà",
    price: 85000,
    image:
      "https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 4,
    displayOrder: 60,
  },
  {
    id: "7",
    name: "Mì Ý sốt thịt băm đặc biệt",
    description:
      "Mì Ý với sốt thịt bò băm, phô mai parmesan và các loại rau thơm",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "main",
    rating: 5,
    displayOrder: 70,
  },
  // Gà ủ muối
  {
    id: "15",
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
    id: "16",
    name: "Gà ủ muối",
    description: "Gà ủ muối, đu đủ, cà rốt, rau răm, sốt",
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
  {
    id: "17",
    name: "Gà ủ muối hoa tiêu 1 con",
    description: "Gà ủ muối hoa tiêu 1 con",
    price: 265000,
    image:
      "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken",
    rating: 5,
    displayOrder: 230,
  },
  {
    id: "18",
    name: "Gà ủ muối xé trộn 1/4 con",
    description: "Gà ủ muối xé trộn 1/4 con",
    price: 80000,
    image:
      "https://images.unsplash.com/photo-1606728035253-49e8a23146de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken",
    rating: 4,
    displayOrder: 240,
  },
  {
    id: "19",
    name: "Gà ủ muối xé trộn",
    description: "Gà ủ muối xé trộn\nGà ủ muối, đu đủ, cà rốt, rau răm, sốt.",
    price: 145000,
    image:
      "https://images.unsplash.com/photo-1606728035253-49e8a23146de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken",
    rating: 4,
    displayOrder: 250,
    sizes: [
      { name: "1/4 con", price: 80000 },
      { name: "1/2 con", price: 145000 },
    ],
  },
  // Chân gà
  {
    id: "20",
    name: "Chân gà rút xương xốt Thái",
    description: "Chân gà rút xương xốt Thái",
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
    id: "21",
    name: "Chân gà rút xương sả tắc lớn",
    description: "Chân gà rút xương sả tắc lớn",
    price: 75000,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 320,
  },
  {
    id: "22",
    name: "Gỏi chân gà rút xương nhỏ",
    description: "Gỏi chân gà rút xương nhỏ",
    price: 50000,
    image:
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 330,
  },
  {
    id: "23",
    name: "Chân gà rút xương sả tắc nhỏ",
    description: "Chân gà rút xương sả tắc nhỏ",
    price: 60000,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 340,
  },
  {
    id: "24",
    name: "Chân gà rút xương ủ muối hoa tiêu",
    description: "Chân gà rút xương ủ muối hoa tiêu (350g)",
    price: 75000,
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 350,
  },
  {
    id: "25",
    name: "Gỏi chân gà rút xương lớn",
    description: "Gỏi chân gà rút xương lớn",
    price: 70000,
    image:
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "chicken-feet",
    rating: 4,
    displayOrder: 360,
  },
  // Đồ uống
  {
    id: "8",
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
    id: "9",
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
    id: "10",
    name: "Redbull",
    description: "Nước tăng lực Redbull",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1551870573-6f5e93e660fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 430,
  },
  {
    id: "11",
    name: "Nước Suối",
    description: "Nước suối tinh khiết",
    price: 15000,
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 440,
  },
  {
    id: "12",
    name: "Nước me đá",
    description: "Nước me tươi với đá mát lạnh",
    price: 35000,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 450,
  },
  {
    id: "13",
    name: "Cà phê đen đá",
    description: "Cà phê đen đậm đà với đá",
    price: 35000,
    image:
      "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    category: "drinks",
    rating: 4,
    displayOrder: 460,
  },
];
