import type { Metadata } from "next";
import CommunityClient from "./CommunityClient";
import { getSharedCommunityPosts } from "@/lib/serverStore";
import { getSupabase, rowToPost } from "@/lib/supabase/db";
import { CommunityPost } from "@/lib/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

async function getInitialCommunityPosts(): Promise<CommunityPost[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(rowToPost);
      }
    } catch (e) {
      console.warn("Supabase SSR community error:", e);
    }
  }
  return getSharedCommunityPosts();
}

export const instant = false;

export const metadata: Metadata = {
  title: "커뮤니티 (Community) — 사이드 프로젝트 메이커 이야기",
  description:
    "사이드 프로젝트 메이커들과 함께 아이디어를 나누고, 피드백을 요청하며 동료를 찾아보세요. 질의응답과 런칭 스토리를 공유합니다.",
  alternates: {
    canonical: `${SITE_URL}/community`,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${SITE_URL}/community`,
    title: "커뮤니티 (Community) | zemix",
    description: "사이드 프로젝트 메이커들과 아이디어를 나누고 피드백을 받아보세요.",
    siteName: "zemix",
  },
};

export default async function CommunityPage() {
  const initialPosts = await getInitialCommunityPosts();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "zemix 커뮤니티 게시글 목록",
    numberOfItems: initialPosts.length,
    itemListElement: initialPosts.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title,
      description: p.content?.slice(0, 100),
      url: `${SITE_URL}/community?post=${p.id}`,
    })),
  };

  return (
    <>
      {initialPosts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <CommunityClient initialPosts={initialPosts} />
    </>
  );
}
