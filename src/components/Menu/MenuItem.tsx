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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const { name, description, price, image, rating, sizes, category } = item;
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes && sizes.length > 0 ? sizes[0].name : null,
  );

  // Get current price based on selected size or default price
  const currentPrice = selectedSize
    ? sizes?.find((s) => s.name === selectedSize)?.price || price
    : price;

  // Format price with Vietnamese currency
  const formatPrice = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "₫";
  };

  // Category name mapping for badge display
  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      special: "Đ��c biệt",
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

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
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
          <h3 className="text-lg font-bold line-clamp-1" title={name}>
            {name}
          </h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
            <span className="text-sm ml-1 text-gray-700">{rating}/5</span>
          </div>
        </div>
        <p
          className="text-gray-600 text-sm line-clamp-2 min-h-[40px]"
          title={description}
        >
          {description}
        </p>

        {/* Price and Size Selection - Old Layout */}
        <div className="mt-4">
          {sizes && sizes.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Select
                value={selectedSize || undefined}
                onValueChange={handleSizeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn kích cỡ" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.name} value={size.name}>
                      {size.name} - {formatPrice(size.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex justify-between items-center mt-2">
                <div className="text-xl font-bold text-orange-500">
                  {formatPrice(currentPrice)}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-9 w-9"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-orange-500">
                {formatPrice(price)}
              </div>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-9 w-9"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
