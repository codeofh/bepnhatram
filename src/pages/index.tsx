import React, { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { MenuGrid } from "@/components/Menu/MenuGrid";
import { HeroSlider } from "@/components/Hero/HeroSlider";
import { LocationMap } from "@/components/Maps/LocationMap";
import { menuItems } from "@/data/menuItems";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { StructuredData } from "@/components/SEO/StructuredData";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <SEO 
        title="BẾP NHÀ TRÂM - Món ăn ngon tại Huế" 
        description="BẾP NHÀ TRÂM - Căn bếp nhỏ nhà Trâm cùng những món ăn ngon. Chuyên các món gà ủ muối, chân gà và các món ăn đặc sắc khác tại Huế."
        image="/og-image.jpg"
      />
      <StructuredData type="restaurant" />

      <Layout 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      >
        <HeroSlider />

        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar for desktop */}
            <div className="hidden md:block md:w-1/4">
              <Sidebar
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            </div>

            {/* Menu content */}
            <div className="w-full md:w-3/4">
              <MenuGrid 
                items={menuItems} 
                activeCategory={activeCategory} 
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </main>

        <LocationMap />
      </Layout>
    </>
  );
}