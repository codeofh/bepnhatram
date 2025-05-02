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

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1501189037839-b93cd878be33?q=80&w=1920&auto=format&fit=crop",
    title: "Ẩm Thực Việt Nam Đặc Sắc",
    description: "Khám phá hương vị truyền thống với các món ăn được chế biến từ nguyên liệu tươi ngon",
    cta: "Xem thực đơn"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1553530979-fbb9e4aee36e?q=80&w=1920&auto=format&fit=crop",
    title: "Không Gian Ấm Cúng",
    description: "Tận hưởng bữa ��n trong không gian hiện đại nhưng vẫn đậm nét văn hóa Việt",
    cta: "Đặt bàn ngay"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1920&auto=format&fit=crop",
    title: "Ưu Đãi Đặc Biệt",
    description: "Khuyến mãi hấp dẫn cho thành viên mới và khách hàng thân thiết",
    cta: "Xem ưu đãi"
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