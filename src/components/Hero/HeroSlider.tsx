"use client"

import React, { useEffect } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/siteConfig"

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Bò Lúc Lắc Khoai Tây",
    description: `Thịt bò thăn mềm xào cùng khoai tây và rau củ, món ăn đậm đà đặc trưng của ${siteConfig.name}`,
    cta: "Đặt món ngay"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Mì Ý Sốt Thịt Băm",
    description: "Mì Ý với sốt thịt bò băm đậm đà, phô mai parmesan và các loại rau thơm tươi ngon",
    cta: "Xem thực đơn"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Gà Ủ Muối Đặc Biệt",
    description: `Món gà ủ muối đặc trưng của ${siteConfig.name}, được chế biến theo công thức gia truyền`,
    cta: "Đặt món ngay"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Chân Gà Rút Xương",
    description: "Chân gà rút xương được chế biến với nhiều hương vị độc đáo: sả tắc, xốt Thái, ủ muối hoa tiêu",
    cta: "Xem thực đơn"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Món Đặc Biệt",
    description: "Khám phá các món đặc biệt như nghêu trộn xốt Thái, nem chả với xốt thần thánh độc quyền",
    cta: "Khám phá ngay"
  }
]

export function HeroSlider() {
  const [api, setApi] = React.useState<any>()
  const [current, setCurrent] = React.useState(0)

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", onSelect)

    // Auto-slide every 5 seconds
    const autoSlideInterval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, 5000)

    return () => {
      api.off("select", onSelect)
      clearInterval(autoSlideInterval)
    }
  }, [api])

  return (
    <div className="relative w-full overflow-hidden">
      <div className="container mx-auto">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full"
        >
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id} className="relative h-[250px] md:h-[350px]">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === 1}
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center px-8 md:px-16">
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 max-w-lg">{slide.title}</h2>
                  <p className="text-white/90 text-base md:text-lg max-w-md mb-4">{slide.description}</p>
                  <Button className="w-fit bg-blue-600 hover:bg-blue-700">{slide.cta}</Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 bg-white/30 hover:bg-white/50 border-none" />
        <CarouselNext className="right-4 bg-white/30 hover:bg-white/50 border-none" />
        </Carousel>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === current ? "bg-white w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        </div>
      </div>
    </div>
  )
}