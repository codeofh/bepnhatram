import React, { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { MenuGrid } from "@/components/Menu/MenuGrid";
import { HeroSlider } from "@/components/Hero/HeroSlider";
import { LocationMap } from "@/components/Maps/LocationMap";
import { menuItems } from "@/data/menuItems";
import { Layout } from "@/components/Layout/Layout";
import { SEO } from "@/components/SEO/SEO";
import { StructuredData } from "@/components/SEO/StructuredData";
import { siteConfig } from "@/config/siteConfig";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <SEO
        title={siteConfig.seo.homePageTitle}
        description={siteConfig.seo.defaultDescription}
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
          {/* Menu Grid for Mobile - Full Width */}
          <div className="md:hidden w-full mb-6">
            <MenuGrid
              items={menuItems}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar for desktop */}
            <div className="hidden md:block md:w-1/4">
              <Sidebar
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            </div>

            {/* Menu content for desktop */}
            <div className="w-full md:w-3/4">
              <div className="hidden md:block">
                <MenuGrid
                  items={menuItems}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </div>
        </main>

        <LocationMap />
      </Layout>
    </>
  );
}