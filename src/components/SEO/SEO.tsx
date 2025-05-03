import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

export function SEO({
  title = 'BẾP NHÀ TRÂM - Món ăn ngon tại Huế',
  description = 'BẾP NHÀ TRÂM - Căn bếp nhỏ nhà Trâm cùng những món ăn ngon. Chuyên các món gà ủ muối, chân gà và các món ăn đặc sắc khác tại Huế.',
  image = '/og-image.jpg',
  article = false,
}: SEOProps) {
  const router = useRouter();
  const canonicalUrl = `https://bepnhatram.com${router.asPath}`;
  const siteUrl = 'https://bepnhatram.com';
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="BẾP NHÀ TRÂM" />
      <meta property="og:locale" content="vi_VN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="keywords" content="BẾP NHÀ TRÂM, nhà hàng Huế, món ăn ngon, gà ủ muối, chân gà, đặc sản Huế, ẩm thực Huế" />
      <meta name="author" content="BẾP NHÀ TRÂM" />
    </Head>
  );
}