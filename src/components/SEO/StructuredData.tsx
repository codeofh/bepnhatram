import React from "react";
import Head from "next/head";
import { SiteSettings } from "@/lib/firebaseSettings";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

interface StructuredDataProps {
  type?: "restaurant" | "product" | "article";
  data?: any;
  siteSettings?: SiteSettings;
}

export function StructuredData({
  type = "restaurant",
  data,
  siteSettings = defaultSiteConfig,
}: StructuredDataProps) {
  // Default restaurant data
  const restaurantData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: siteSettings.name,
    image: `${siteSettings.url}${siteSettings.seo.ogImageUrl}`,
    "@id": siteSettings.url,
    url: siteSettings.url,
    telephone: siteSettings.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.contact.address,
      addressLocality: siteSettings.contact.city,
      addressRegion: siteSettings.contact.region,
      postalCode: siteSettings.contact.postalCode,
      addressCountry: siteSettings.contact.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: parseFloat(siteSettings.maps.latitude),
      longitude: parseFloat(siteSettings.maps.longitude),
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "22:00",
    },
    servesCuisine: ["Vietnamese", "Asian"],
    priceRange: "$$",
    menu: siteSettings.url,
    acceptsReservations: "True",
  };

  // Product structured data template
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data?.name || "Gà Ủ Muối",
    image: data?.image || `${siteSettings.url}${siteSettings.seo.ogImageUrl}`,
    description:
      data?.description || `Món gà ủ muối đặc sắc của ${siteSettings.name}`,
    offers: {
      "@type": "Offer",
      price: data?.price || "150000",
      priceCurrency: siteSettings.settings.currency,
      availability: "https://schema.org/InStock",
    },
  };

  // Article structured data template
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      data?.title || `${siteSettings.name} - ${siteSettings.description}`,
    image: data?.image || `${siteSettings.url}${siteSettings.seo.ogImageUrl}`,
    datePublished: data?.datePublished || new Date().toISOString(),
    dateModified: data?.dateModified || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: data?.author || siteSettings.name,
    },
  };

  // Select the appropriate structured data based on type
  let structuredData;
  switch (type) {
    case "product":
      structuredData = productData;
      break;
    case "article":
      structuredData = articleData;
      break;
    default:
      structuredData = restaurantData;
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}
