import React from 'react';
import Head from 'next/head';
import { siteConfig } from '@/config/siteConfig';

interface StructuredDataProps {
  type?: 'restaurant' | 'product' | 'article';
  data?: any;
}

export function StructuredData({ type = 'restaurant', data }: StructuredDataProps) {
  // Default restaurant data
  const restaurantData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    image: `${siteConfig.url}${siteConfig.seo.ogImageUrl}`,
    '@id': siteConfig.url,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.address,
      addressLocality: siteConfig.contact.city,
      addressRegion: siteConfig.contact.region,
      postalCode: siteConfig.contact.postalCode,
      addressCountry: siteConfig.contact.countryCode
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: parseFloat(siteConfig.maps.latitude),
      longitude: parseFloat(siteConfig.maps.longitude)
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '10:00',
      closes: '22:00'
    },
    servesCuisine: ['Vietnamese', 'Asian'],
    priceRange: '$$',
    menu: 'https://bepnhatram.com',
    acceptsReservations: 'True'
  };

  // Product structured data template
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data?.name || 'Gà Ủ Muối',
    image: data?.image || `${siteConfig.url}${siteConfig.seo.ogImageUrl}`,
    description: data?.description || `Món gà ủ muối đặc sắc của ${siteConfig.name}`,
    offers: {
      '@type': 'Offer',
      price: data?.price || '150000',
      priceCurrency: siteConfig.settings.currency,
      availability: 'https://schema.org/InStock'
    }
  };

  // Article structured data template
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data?.title || `${siteConfig.name} - ${siteConfig.description}`,
    image: data?.image || `${siteConfig.url}${siteConfig.seo.ogImageUrl}`,
    datePublished: data?.datePublished || new Date().toISOString(),
    dateModified: data?.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: data?.author || siteConfig.name
    }
  };

  // Select the appropriate structured data based on type
  let structuredData;
  switch (type) {
    case 'product':
      structuredData = productData;
      break;
    case 'article':
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