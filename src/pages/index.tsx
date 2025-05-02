import React, { useState } from "react";
import Head from "next/head";
import { Sidebar } from "@/components/Layout/Sidebar";
import { MenuGrid } from "@/components/Menu/MenuGrid";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { HeroSlider } from "@/components/Hero/HeroSlider";
import { LocationMap } from "@/components/Maps/LocationMap";
import { menuItems } from "@/data/menuItems";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Head>
        <title>BẾP NHÀ Trâm | Menu</title>
        <meta name="description" content="Thực đơn BẾP NHÀ Trâm với các món ăn đặc sắc" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />

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

            {/* Mobile sidebar */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar}>
              <div className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="p-4">
                  <Sidebar
                    activeCategory={activeCategory}
                    setActiveCategory={(category) => {
                      setActiveCategory(category);
                      setIsSidebarOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Menu content */}
            <div className="w-full md:w-3/4">
              <MenuGrid items={menuItems} activeCategory={activeCategory} />
            </div>
          </div>
        </main>

        <LocationMap />

        <Footer />
      </div>
    </>
  );
}