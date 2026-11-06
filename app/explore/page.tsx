import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";
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
      console.warn("Supabase SSR explore projects error:", e);
    }
  }
  return getSharedProjects();
}

export const instant = false;

export const metadata: Metadata = {
  title: "프로젝트 탐색 — 다양한 사이드 프로젝트 둘러보기",
  description:
    "AI, SaaS, 개발자 도구, 생산성, 디자인 등 다양한 카테고리의 사이드 프로젝트를 탐색하고 초기 피드백을 전달하세요.",
  alternates: {
    canonical: `${SITE_URL}/explore`,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${SITE_URL}/explore`,
    title: "프로젝트 탐색 | zemix",
    description: "다양한 분야의 사이드 프로젝트를 탐색하고 피드백을 남겨보세요.",
    siteName: "zemix",
  },
};

export default async function ExplorePage() {
  const initialProjects = await getInitialProjects();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "zemix 탐색 프로젝트",
    numberOfItems: initialProjects.length,
    itemListElement: initialProjects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title,
      description: p.tagline,
      url: `${SITE_URL}/projects/${p.id}`,
    })),
  };

  return (
    <>
      {initialProjects.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <ExploreClient initialProjects={initialProjects} />
    </>
  );
}
