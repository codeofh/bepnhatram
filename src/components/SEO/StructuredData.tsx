import React from 'react';
import Head from 'next/head';

interface StructuredDataProps {
  type?: 'restaurant' | 'product' | 'article';
  data?: any;
}

export function StructuredData({ type = 'restaurant', data }: StructuredDataProps) {
  // Default restaurant data
  const restaurantData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'BẾP NHÀ TRÂM',
    image: 'https://bepnhatram.com/og-image.jpg',
    '@id': 'https://bepnhatram.com',
    url: 'https://bepnhatram.com',
    telephone: '0886286032',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '15/15 Đống Đa, Phú Nhuận',
      addressLocality: 'Huế',
      addressRegion: 'Thừa Thiên Huế',
      postalCode: '530000',
      addressCountry: 'VN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 16.4637,
      longitude: 107.5909
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
    image: data?.image || 'https://bepnhatram.com/og-image.jpg',
    description: data?.description || 'Món gà ủ muối đặc sắc của BẾP NHÀ TRÂM',
    offers: {
      '@type': 'Offer',
      price: data?.price || '150000',
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock'
    }
  };

  // Article structured data template
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data?.title || 'BẾP NHÀ TRÂM - Căn bếp nhỏ nhà Trâm cùng những món ăn ngon',
    image: data?.image || 'https://bepnhatram.com/og-image.jpg',
    datePublished: data?.datePublished || new Date().toISOString(),
    dateModified: data?.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: data?.author || 'BẾP NHÀ TRÂM'
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