import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { SiteSettings } from "@/lib/firebaseSettings";
import { siteConfig as defaultSiteConfig } from "@/config/siteConfig";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  siteSettings?: SiteSettings;
}

export function SEO({
  title,
  description,
  image,
  article = false,
  siteSettings = defaultSiteConfig,
}: SEOProps) {
  const router = useRouter();

  // Use provided description or get from settings
  const finalDescription = description || siteSettings.seo.defaultDescription;

  // Use provided image or get from settings
  const finalImage = image || siteSettings.seo.ogImageUrl;

  // Create page title using settings template
  const pageTitle = title
    ? siteSettings.seo.titleTemplate.replace("%s", title)
    : siteSettings.seo.defaultTitle;

  // Build canonical URL
  const canonicalUrl = `${siteSettings.url}${router.asPath}`;

  // Handle both relative and absolute image URLs
  const fullImageUrl = finalImage.startsWith("http")
    ? finalImage
    : `${siteSettings.url}${finalImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteSettings.name} />
      <meta
        property="og:locale"
        content={siteSettings.settings.locale.replace("-", "_")}
      />

      {/* Zalo */}
      <meta property="zalo:url" content={canonicalUrl} />
      <meta property="zalo:title" content={pageTitle} />
      <meta property="zalo:description" content={description} />
      <meta property="zalo:image" content={fullImageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      {siteSettings.seo.twitterHandle && (
        <meta name="twitter:site" content={siteSettings.seo.twitterHandle} />
      )}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="keywords" content={siteSettings.seo.keywords} />
      <meta name="author" content={siteSettings.name} />
    </Head>
  );
}
