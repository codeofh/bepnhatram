import React, { useState } from "react";
import Image from "next/image";
import { Star, Plus, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem as MenuItemType } from "@/data/menuItems";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const { name, description, price, image, rating, sizes, category } = item;
  const [isHovered, setIsHovered] = useState(false);

  // Format price with Vietnamese currency
  const formatPrice = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "₫";
  };

  // Category name mapping for badge display
  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      special: "Đặc biệt",
      main: "Món chính",
      chicken: "Gà ủ muối",
      "chicken-feet": "Chân gà",
      drinks: "Đồ uống",
    };

    return categories[categoryId] || "Khác";
  };

  // Color mapping for category badges
  const getCategoryColor = (categoryId: string): string => {
    const colors: Record<string, string> = {
      special: "bg-purple-100 text-purple-800",
      main: "bg-orange-100 text-orange-800",
      chicken: "bg-amber-100 text-amber-800",
      "chicken-feet": "bg-red-100 text-red-800",
      drinks: "bg-blue-100 text-blue-800",
    };

    return colors[categoryId] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge className={`${getCategoryColor(category)}`}>
          {getCategoryName(category)}
        </Badge>
      </div>

      {/* Quick actions on hover */}
      <div
        className={`absolute top-2 right-2 z-10 flex gap-1 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/80 backdrop-blur-sm"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xem chi tiết</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/80 backdrop-blur-sm"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thêm vào giỏ hàng</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          priority={false}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold truncate">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
            <span className="text-sm ml-1 text-gray-700">{rating}/5</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
          {description}
        </p>

        {sizes && sizes.length > 0 ? (
          <div className="mt-3 space-y-2">
            {sizes.map((size, index) => (
              <div
                key={size.name}
                className="flex justify-between items-center text-sm border-t border-dashed border-gray-200 pt-2"
              >
                <span className="text-gray-700">{size.name}</span>
                <span className="font-semibold">{formatPrice(size.price)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex justify-between items-center">
            <span className="font-bold text-lg">{formatPrice(price)}</span>
          </div>
        )}

        <div className="mt-4">
          <Button className="w-full group">
            <ShoppingCart className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Thêm vào giỏ hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
