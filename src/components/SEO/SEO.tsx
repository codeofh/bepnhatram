import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { siteConfig } from '@/config/siteConfig';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

export function SEO({
  title,
  description = siteConfig.seo.defaultDescription,
  image = siteConfig.seo.ogImageUrl,
  article = false,
}: SEOProps) {
  const router = useRouter();
  const pageTitle = title 
    ? siteConfig.seo.titleTemplate.replace('%s', title)
    : siteConfig.seo.defaultTitle;
  const canonicalUrl = `${siteConfig.url}${router.asPath}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content={siteConfig.settings.locale.replace('-', '_')} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      {siteConfig.seo.twitterHandle && (
        <meta name="twitter:site" content={siteConfig.seo.twitterHandle} />
      )}
      
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
      <meta name="keywords" content={siteConfig.seo.keywords} />
      <meta name="author" content={siteConfig.name} />
    </Head>
  );
}