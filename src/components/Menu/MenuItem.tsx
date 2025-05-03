import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToastContext } from "@/contexts/ToastContext";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

export function MenuItem({
  id,
  name,
  description,
  price,
  image,
  category,
  rating,
}: MenuItemProps) {
  const { showWarning } = useToastContext();

  // Format price with dot separator for thousands
  const formattedPrice = `${price.toLocaleString("vi-VN")}₫`;
  
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? "text-blue-500 fill-blue-500" : "text-gray-300"
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

  // Category badge color mapping
  const categoryColorMap = {
    appetizer: "bg-blue-500",
    main: "bg-blue-500",
    dessert: "bg-blue-500",
    drinks: "bg-blue-500",
    chicken: "bg-blue-500",
    "chicken-feet": "bg-blue-600",
    special: "bg-blue-500"
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

  // Function to show development notification
  const showDevelopmentNotification = () => {
    showWarning(`Chức năng này đang được phát triển. Vui lòng quay lại sau!`, "Thông báo");
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
      
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 line-clamp-1">{name}</h3>
        <div className="flex mb-1 sm:mb-2">
          <div className="hidden sm:flex">{renderStars()}</div>
          <div className="flex sm:hidden">{renderStars().slice(0, 3)}</div>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{description}</p>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm sm:text-base md:text-lg">{formattedPrice}</span>
          <button 
            className="bg-white rounded-full p-1 border border-gray-300 hover:bg-gray-50"
            onClick={showDevelopmentNotification}
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
