import React, { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToastContext } from "@/contexts/ToastContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SizeOption } from "@/data/menuItems";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  sizes?: SizeOption[];
}

export function MenuItem({
  id,
  name,
  description,
  price,
  image,
  category,
  rating,
  sizes,
}: MenuItemProps) {
  const { showCartNotification } = useToastContext();
  const [selectedSize, setSelectedSize] = useState<string>(sizes ? sizes[0].name : '');
  const [currentPrice, setCurrentPrice] = useState<number>(sizes ? sizes[0].price : price);

  // Format price with dot separator for thousands
  const formattedPrice = `${currentPrice.toLocaleString("vi-VN")}₫`;

  // Category star color mapping
  const categoryStarColors = {
    appetizer: "text-emerald-500 fill-emerald-500", // Xanh lá - món khai vị
    main: "text-orange-500 fill-orange-500", // Cam - món chính
    dessert: "text-pink-500 fill-pink-500", // Hồng - món tráng miệng
    drinks: "text-blue-500 fill-blue-500", // Xanh dương - đồ uống
    chicken: "text-amber-500 fill-amber-500", // Vàng nâu - gà ủ muối
    "chicken-feet": "text-red-500 fill-red-500", // Đỏ - chân gà
    special: "text-purple-500 fill-purple-500" // Tím - món đặc biệt
  };

  // Category badge color mapping
  const categoryColorMap = {
    appetizer: "bg-emerald-500", // Xanh lá - món khai vị
    main: "bg-orange-500", // Cam - món chính
    dessert: "bg-pink-500", // Hồng - món tráng miệng
    drinks: "bg-blue-500", // Xanh dương - đồ uống
    chicken: "bg-amber-500", // Vàng nâu - gà ủ muối
    "chicken-feet": "bg-red-500", // Đỏ - chân gà
    special: "bg-purple-500" // Tím - món đặc biệt
  };

  // Generate stars based on rating with category color
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? "text-blue-500 fill-blue-500" : "text-gray-300"
            }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return stars;
  };

  // Category name mapping
  const categoryNameMap = {
    appetizer: "Món khai vị",
    main: "Món chính",
    dessert: "Món tráng miệng",
    drinks: "Đồ uống",
    chicken: "Gà ủ muối",
    "chicken-feet": "Chân gà",
    special: "Đặc biệt"
  };

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    const sizeOption = sizes?.find(size => size.name === value);
    if (sizeOption) {
      setCurrentPrice(sizeOption.price);
    }
  };

  // Function to show development notification
  const showDevelopmentNotification = () => {
    const sizeSuffix = sizes ? ` (${selectedSize})` : '';
    showCartNotification('add', `${name}${sizeSuffix}`);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-36 sm:h-40 md:h-48 w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={`${categoryColorMap[category as keyof typeof categoryColorMap]} text-white text-xs`}>
            {categoryNameMap[category as keyof typeof categoryNameMap]}
          </Badge>
        </div>
      </div>

      <div className="p-2 sm:p-3 md:p-4 flex flex-col">
        <div className="flex-grow">
          <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 line-clamp-2 min-h-[2.5em]">{name}</h3>
          <div className="flex mb-1 sm:mb-2">
            {renderStars()}
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{description}</p>
        </div>

        <div className="space-y-2 mt-auto">
          {sizes && (
            <div className="w-full">
              <Select value={selectedSize} onValueChange={handleSizeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn kích cỡ" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.name} value={size.name}>
                      {size.name} - {size.price.toLocaleString("vi-VN")}₫
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between w-full bg-gray-50/50 rounded-lg px-3 py-2">
            <div>
              <span className="font-bold text-sm sm:text-base md:text-lg">{formattedPrice}</span>
            </div>
            <button
              className="bg-white rounded-full p-1.5 border border-gray-300 hover:bg-gray-50 flex-shrink-0"
              onClick={showDevelopmentNotification}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
