import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { List, Apple, Coffee, Heart, GlassWater, LayoutGrid, Beef, Drumstick, Star, Info, Phone } from "lucide-react";

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  onClose?: () => void;
}

export function Sidebar({ activeCategory, setActiveCategory, onClose }: SidebarProps) {
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  const isAboutPage = router.pathname === "/about" || router.pathname.startsWith('/about/');
  const isContactPage = router.pathname === "/contact" || router.pathname.startsWith('/contact/');
  
  const categories = [
    { id: "all", name: "Tất cả", icon: <LayoutGrid size={20} /> },
    { id: "special", name: "Đặc biệt", icon: <Star size={20} /> },
    { id: "main", name: "Món chính", icon: <Coffee size={20} /> },
    { id: "chicken", name: "Gà ủ muối", icon: <Beef size={20} /> },
    { id: "chicken-feet", name: "Chân gà", icon: <Drumstick size={20} /> },
    { id: "drinks", name: "Đồ uống", icon: <GlassWater size={20} /> },
  ];

  // Function to get navigation link classes based on active state
  const getNavLinkClasses = (isActive: boolean) => {
    return `w-full flex items-center p-3 rounded-md transition-colors ${
      isActive 
        ? "bg-gray-100 text-blue-600 font-medium" 
        : "text-gray-700 hover:bg-gray-50"
    }`;
  };

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm">
      {isHomePage && (
        <>
          <div className="flex items-center mb-6 px-2">
            <List size={24} className="mr-2" />
            <h2 className="text-xl font-bold">Danh mục</h2>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  if (onClose) onClose();
                }}
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
        </>
      )}
      
      {/* Navigation links */}
      <div className={`${isHomePage ? 'md:hidden mt-6 pt-6 border-t border-gray-200' : ''}`}>
        {isHomePage && <h3 className="text-sm font-medium text-gray-500 mb-3 px-3">Trang</h3>}
        
        <Link href="/" 
          className={getNavLinkClasses(isHomePage)}
          onClick={onClose}
        >
          <span className="mr-3"><Coffee size={20} /></span>
          <span>Món ăn</span>
        </Link>
        
        <Link href="/about" 
          className={getNavLinkClasses(isAboutPage)}
          onClick={onClose}
        >
          <span className="mr-3"><Info size={20} /></span>
          <span>Giới thiệu</span>
        </Link>
        
        <Link href="/contact" 
          className={getNavLinkClasses(isContactPage)}
          onClick={onClose}
        >
          <span className="mr-3"><Phone size={20} /></span>
          <span>Liên hệ</span>
        </Link>
      </div>
    </div>
  );
}