import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import GlobalShortcuts from "@/components/GlobalShortcuts";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "zemix",
  appleWebApp: {
    capable: true,
    title: "zemix",
    statusBarStyle: "default",
  },
  title: {
    default: "zemix — 사이드 프로젝트 메이커 커뮤니티",
    template: "%s | zemix",
  },
  description:
    "zemix(제믹스, zemix.vercel.app)는 혁신적인 아이디어를 직접 빌드하고 런칭하는 사이드 프로젝트 메이커 커뮤니티입니다. 초기 유저 피드백과 동료를 만나보세요.",
  keywords: [
    "zemix",
    "제믹스",
    "zemix.vercel.app",
    "zemix 커뮤니티",
    "사이드 프로젝트",
    "사이드프로젝트",
    "사이드 프로젝트 플랫폼",
    "사이드 프로젝트 공유",
    "사이드 프로젝트 런칭",
    "메이커 커뮤니티",
    "1인 개발",
    "1인 개발자",
    "인디해커",
    "인디메이커",
    "토이프로젝트",
    "스타트업",
    "프로덕트 런칭",
    "피드백",
    "사용자 피드백",
    "베타 테스터 모집",
    "팀원모집",
    "개발자 커뮤니티",
    "SchoolEcho",
    "스쿨에코",
    "Buildit",
    "장현",
    "메이커 장현",
  ],
  authors: [
    { name: "장현 (Jang Hyun)", url: `${SITE_URL}/about` },
    { name: "zemix", url: SITE_URL },
  ],
  creator: "장현 (Jang Hyun)",
  publisher: "zemix",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    title: "zemix — 사이드 프로젝트 메이커 커뮤니티",
    description: "유저를 만나고, 함께 만드는 사이드 프로젝트 플랫폼 (zemix.vercel.app)",
    siteName: "zemix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "zemix — 사이드 프로젝트 메이커 커뮤니티",
        type: "image/png",
      },
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "zemix logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "zemix — 사이드 프로젝트 메이커 커뮤니티",
    description: "유저를 만나고, 함께 만드는 사이드 프로젝트 플랫폼",
    images: ["/og-image.png"],
  },
  verification: {
    google: "X7GuELZ3QuhLEU_nkwkIedtsOA_0u22iClaGBMg2cKc",
    ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { other: { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION } }
      : {}),
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "zemix",
      alternateName: ["Zemix", "제믹스", "zemix.vercel.app", "제믹스 커뮤니티", "제믹스 플랫폼"],
      description:
        "zemix는 사이드 프로젝트를 런칭하고 초기 유저를 만나 피드백과 동료를 구하는 메이커 커뮤니티 플랫폼입니다.",
      inLanguage: "ko-KR",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "zemix",
      alternateName: ["Zemix", "제믹스"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/og-image.png`,
      sameAs: [SITE_URL],
      founder: {
        "@type": "Person",
        "@id": `${SITE_URL}/about#developer`,
        name: "장현",
        alternateName: ["Jang Hyun", "메이커 장현"],
        url: `${SITE_URL}/about`,
        jobTitle: "Full-stack Developer & Maker",
        description:
          "아이디어를 실제 제품으로 빠르게 빌드하는 메이커 장현입니다. zemix, Buildit, SchoolEcho를 제작하고 WCRC 물류로봇대회 대상을 수상했습니다.",
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/about#developer`,
      name: "장현",
      alternateName: ["Jang Hyun", "메이커 장현", "개발자 장현"],
      url: `${SITE_URL}/about`,
      jobTitle: "Full-stack Developer & Maker",
      description:
        "안녕하세요, 아이디어를 실제 제품으로 빠르게 빌드하는 메이커 장현입니다. 사용자에게 실질적인 가치를 주는 서비스를 만드는 것을 좋아하며, 기획부터 개발, 배포까지 전 과정을 직접 다루고 있습니다.",
      knowsAbout: [
        "Next.js",
        "React",
        "Supabase",
        "Vercel",
        "Google AI Studio",
        "Gemini API",
        "Arduino",
        "사이드 프로젝트",
      ],
      award: "2026년 제2회 월드 물류 로봇 딜리버리 학생 경진대회 중등부 대상(1위)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="X7GuELZ3QuhLEU_nkwkIedtsOA_0u22iClaGBMg2cKc" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="antialiased overflow-x-hidden min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Suspense fallback={<div className="h-16 border-b border-border bg-background" />}>
                  <Navbar />
                  <MobileHeader />
                </Suspense>
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <Suspense fallback={null}>
                  <MobileNav />
                  <GlobalShortcuts />
                </Suspense>
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
