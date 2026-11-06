import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getSharedProjects } from "@/lib/serverStore";
import { getSupabase, rowToProject } from "@/lib/supabase/db";
import { Project } from "@/lib/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

async function getInitialProjects(): Promise<Project[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(rowToProject);
      }
    } catch (e) {
      console.warn("Supabase SSR projects fetch error:", e);
    }
  }
  return getSharedProjects();
}

export const instant = false;

export const metadata: Metadata = {
  title: "zemix — 사이드 프로젝트 메이커 커뮤니티",
  description:
    "zemix(제믹스, zemix.vercel.app)는 사이드 프로젝트를 런칭하고 초기 유저 피드백과 동료를 구하는 공식 메이커 커뮤니티 플랫폼입니다. SchoolEcho, zemix 등 메이커들의 사이드 프로젝트를 발견하고 함께 만들어보세요.",
  alternates: {
    canonical: SITE_URL,
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
};

export default async function HomePage() {
  const initialProjects = await getInitialProjects();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "zemix",
    alternateName: ["Zemix", "제믹스", "zemix.vercel.app", "제믹스 커뮤니티"],
    url: SITE_URL,
    description: "사이드 프로젝트 메이커 커뮤니티 플랫폼 (zemix.vercel.app)",
    publisher: {
      "@type": "Organization",
      name: "zemix",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/explore?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "zemix 사이드 프로젝트 목록",
    description: "zemix에 등록된 최신 사이드 프로젝트 목록",
    numberOfItems: initialProjects.length,
    itemListElement: initialProjects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title,
      description: p.tagline || p.description?.slice(0, 100),
      url: `${SITE_URL}/projects/${p.id}`,
      image: p.coverImage || p.logo || `${SITE_URL}/icon.png`,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "zemix(제믹스)는 어떤 서비스인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "zemix(zemix.vercel.app)는 아이디어를 직접 프로덕트로 구현하는 개발자, 디자이너, 기획자 등 사이드 프로젝트 메이커들을 위한 공식 런칭 및 커뮤니티 플랫폼입니다. 누구나 프로젝트를 등록하고 초기 유저 피드백과 동료를 만날 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "프로젝트 등록 및 커뮤니티 이용은 무료인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네, zemix에서 사이드 프로젝트를 등록하고, 피드백을 수집하며, 팀원 모집 및 빌더 프로필을 개설하는 모든 기능은 100% 무료입니다.",
        },
      },
      {
        "@type": "Question",
        name: "어떤 개발 단계의 프로젝트를 공유할 수 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "아이디어 구상 단계(Idea), 실제 제작 중인 단계(Building), 초기 베타 테스터를 모집하는 단계(Beta), 배포 완료된 공식 서비스(Public)까지 모든 단계의 사이드 프로젝트를 자유롭게 등록할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "초기 사용자 피드백과 동료(팀원)는 어떻게 구하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "프로젝트 상세 페이지에서 카테고리별 피드백(아이디어, 버그 리포트, 사용성 개선)과 실시간 댓글을 통해 유저들과 직접 소통할 수 있으며, '팀원 모집 중' 태그를 활성화하여 개발자, 디자이너, 마케터 동료를 모집할 수 있습니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {initialProjects.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient initialProjects={initialProjects} />
    </>
  );
}
