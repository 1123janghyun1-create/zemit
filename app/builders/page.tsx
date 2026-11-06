import type { Metadata } from "next";
import BuildersClient from "./BuildersClient";
import { getSharedBuilders } from "@/lib/serverStore";
import { getSupabase } from "@/lib/supabase/db";
import { Builder } from "@/lib/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

async function getInitialBuilders(): Promise<Builder[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: profiles, error: pError } = await (supabase as any)
        .from("profiles")
        .select("*");

      if (!pError && Array.isArray(profiles)) {
        const realProfiles = profiles.filter((p: any) => !p.id.startsWith("builder-"));

        // Fetch project counts and likes per builder
        const projectStats = new Map<string, { projectsCount: number; totalLikes: number }>();
        const projectAuthors = new Map<string, any>();
        try {
          const { data: projData } = await (supabase as any)
            .from("projects")
            .select("user_id, author, likes_count");
          if (Array.isArray(projData)) {
            projData.forEach((p: any) => {
              const uid = p.user_id || p.author?.id;
              if (uid) {
                const stat = projectStats.get(uid) || { projectsCount: 0, totalLikes: 0 };
                stat.projectsCount += 1;
                stat.totalLikes += (p.likes_count || 0);
                projectStats.set(uid, stat);
                if (p.author && !projectAuthors.has(uid)) {
                  projectAuthors.set(uid, p.author);
                }
              }
            });
          }
        } catch {}

        const profileIdSet = new Set(realProfiles.map((p: any) => p.id));
        const builders: Builder[] = realProfiles.map((p: any) => {
          const stats = projectStats.get(p.id) || { projectsCount: 0, totalLikes: 0 };
          return {
            id: p.id,
            name: p.name || "Maker",
            handle: p.handle || "maker",
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
            bio: p.bio || "zemix 메이커",
            role: p.role || "Maker",
            isStartingMember: p.is_starting_member ?? true,
            followersCount: p.followers_count || 0,
            isFollowing: false,
            projectsCount: stats.projectsCount,
            totalLikes: stats.totalLikes,
            socials: {
              github: p.github_url,
              twitter: p.twitter_url,
              website: p.website_url,
            },
          };
        });

        // Also include any project authors who don't have a profile row
        projectAuthors.forEach((author, uid) => {
          if (!profileIdSet.has(uid) && !uid.startsWith("builder-")) {
            const stats = projectStats.get(uid) || { projectsCount: 1, totalLikes: 0 };
            builders.push({
              id: uid,
              name: author.name || "Maker",
              handle: author.handle || "maker",
              avatar: author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
              bio: author.bio || "zemix 메이커",
              role: author.role || "Maker",
              isStartingMember: author.isStartingMember ?? true,
              followersCount: author.followersCount || 0,
              isFollowing: false,
              projectsCount: stats.projectsCount,
              totalLikes: stats.totalLikes,
              socials: author.socials,
            });
          }
        });

        builders.sort((a, b) => {
          const diff = (b.followersCount || 0) - (a.followersCount || 0);
          if (diff !== 0) return diff;
          return (a.name || "").localeCompare(b.name || "");
        });

        return builders;
      }
    } catch (e) {
      console.warn("Supabase SSR builders error:", e);
    }
  }
  return getSharedBuilders();
}

export const instant = false;

export const metadata: Metadata = {
  title: "빌더 (Builders) — zemix 사이드 프로젝트 메이커들",
  description:
    "실제 사이드 프로젝트를 만들고 서비스로 런칭하고 있는 zemix의 메이커와 개발자들을 만나보세요. 팔로우하고 협업을 제안할 수 있습니다.",
  alternates: {
    canonical: `${SITE_URL}/builders`,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: `${SITE_URL}/builders`,
    title: "빌더 (Builders) | zemix",
    description: "사이드 프로젝트 메이커와 개발자들을 만나보세요.",
    siteName: "zemix",
  },
};

export default async function BuildersPage() {
  const initialBuilders = await getInitialBuilders();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "zemix 빌더 목록",
    numberOfItems: initialBuilders.length,
    itemListElement: initialBuilders.map((b, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: b.name,
      description: b.bio,
      url: `${SITE_URL}/builders/${b.id}`,
      image: b.avatar,
    })),
  };

  return (
    <>
      {initialBuilders.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <BuildersClient initialBuilders={initialBuilders} />
    </>
  );
}
