import { Html, Head, Main, NextScript } from "next/document";
import { siteConfig } from "@/config/siteConfig";

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        <meta name="application-name" content={siteConfig.name} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
