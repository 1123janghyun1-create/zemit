import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

export const metadata: Metadata = {
  title: "개발자 소개 & 서비스 소개 — 메이커 장현 (zemix)",
  description:
    "아이디어를 실제 제품으로 빠르게 빌드하는 메이커 장현입니다. zemix, Buildit, SchoolEcho 개발 및 2026 WCRC 월드 물류 로봇 학생 경진대회 중등부 대상(1위) 수상. 기획부터 개발, 배포까지 전 과정을 다루는 메이커 장현의 기술 스택과 프로젝트를 소개합니다.",
  keywords: [
    "장현",
    "메이커 장현",
    "개발자 장현",
    "zemix 개발자",
    "SchoolEcho",
    "Buildit",
    "WCRC 물류로봇대회",
    "Gemini API 개발자",
    "사이드 프로젝트 메이커",
    "Full-stack Developer",
  ],
  authors: [{ name: "장현 (Jang Hyun)", url: `${SITE_URL}/about` }],
  openGraph: {
    type: "profile",
    locale: "ko_KR",
    title: "개발자 소개 — 메이커 장현 | zemix",
    description:
      "아이디어를 실제 제품으로 빠르게 빌드하는 메이커 장현입니다. zemix, Buildit, SchoolEcho 개발 및 WCRC 대상 수상.",
    url: `${SITE_URL}/about`,
    siteName: "zemix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "메이커 장현 - zemix",
      },
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "메이커 장현 - zemix",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "개발자 소개 — 메이커 장현 | zemix",
    description:
      "아이디어를 실제 제품으로 빠르게 빌드하는 메이커 장현입니다. zemix, Buildit, SchoolEcho 개발 및 WCRC 대상 수상.",
    images: ["/og-image.png"],
  },
};

const jsonLdDeveloper = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/about#developer`,
      name: "장현",
      alternateName: ["Jang Hyun", "메이커 장현", "개발자 장현"],
      url: `${SITE_URL}/about`,
      jobTitle: "Full-stack Developer & Maker",
      description:
        "안녕하세요, 아이디어를 실제 제품으로 빠르게 빌드하는 메이커 장현입니다. 사용자에게 실질적인 가치를 주는 서비스를 만드는 것을 좋아하며 기획부터 개발, 배포까지 전 과정을 직접 다루고 있습니다.",
      knowsAbout: [
        "Vercel",
        "Netlify",
        "HTML/CSS/JS",
        "React",
        "Next.js",
        "Google AI Studio",
        "Gemini API",
        "Ultron WASM",
        "Supabase",
        "PostgreSQL",
        "Git/GitHub",
        "Arduino",
        "자율주행 로봇",
        "사이드 프로젝트",
      ],
      award: "2026년 제2회 월드 물류 로봇 딜리버리 학생 경진대회 중등부 대상(1위)",
      sameAs: [SITE_URL],
    },
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: "개발자 소개 & 서비스 소개 — 메이커 장현 (zemix)",
      description:
        "zemix 플랫폼 소개와 파운더 메이커 장현의 프로필, 기술 스택, 프로젝트 및 수상 이력을 소개합니다.",
      mainEntity: {
        "@id": `${SITE_URL}/about#developer`,
      },
    },
  ],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDeveloper) }}
      />
      {children}
    </>
  );
}
