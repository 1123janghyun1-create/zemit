import type { Metadata } from "next";
import { Suspense } from "react";
import BuilderDetailClient from "./BuilderDetailClient";
import { getSharedBuilders, getSharedProjects } from "@/lib/serverStore";
import { getSupabase, rowToProject } from "@/lib/supabase/db";
import { Builder, Project, CommunityPost } from "@/lib/types";

export const instant = false;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

async function getBuilderData(id: string): Promise<{
  builder: Builder | null;
  projects: Project[];
  posts: CommunityPost[];
}> {
  if (!id || id === "preview") {
    return { builder: null, projects: [], posts: [] };
  }

  const supabase = getSupabase();
  let builder: Builder | null = null;
  let projects: Project[] = [];
  let posts: CommunityPost[] = [];

  if (supabase) {
    try {
      // 1. Look up profile by id or handle
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("*")
        .or(`id.eq.${id},handle.eq.${id}`)
        .maybeSingle();

      if (profile) {
        builder = {
          id: profile.id,
          name: profile.name || "Maker",
          handle: profile.handle || "maker",
          avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          bio: profile.bio || "zemix 메이커",
          role: profile.role || "Maker",
          isStartingMember: profile.is_starting_member ?? true,
          followersCount: profile.followers_count || 0,
          isFollowing: false,
          projectsCount: 0,
          totalLikes: 0,
          socials: {
            github: profile.github_url || undefined,
            twitter: profile.twitter_url || undefined,
            website: profile.website_url || undefined,
          },
        };
      }
    } catch (e) {
      console.warn("Supabase profile lookup error:", e);
    }

    // 2. Look up projects by this builder (by user_id, builder.id, or author handle)
    try {
      const targetId = builder?.id || id;
      const targetHandle = builder?.handle || id;

      const { data: projData } = await (supabase as any)
        .from("projects")
        .select("*")
        .or(`user_id.eq.${targetId},author->>id.eq.${targetId},author->>handle.eq.${targetHandle}`)
        .order("created_at", { ascending: false });

      if (Array.isArray(projData) && projData.length > 0) {
        projects = projData.map(rowToProject);

        // If builder was not found in profiles, extract builder from project.author
        if (!builder && projects[0]?.author) {
          builder = {
            id: projects[0].author.id || targetId,
            name: projects[0].author.name || "Maker",
            handle: projects[0].author.handle || "maker",
            avatar: projects[0].author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetId}`,
            bio: projects[0].author.bio || "zemix 메이커",
            role: projects[0].author.role || "Maker",
            isStartingMember: projects[0].author.isStartingMember ?? true,
            followersCount: projects[0].author.followersCount || 0,
            isFollowing: false,
            projectsCount: projects.length,
            totalLikes: projects.reduce((acc, p) => acc + (p.likesCount || 0), 0),
            socials: projects[0].author.socials,
          };
        }
      }
    } catch (e) {
      console.warn("Supabase projects lookup error:", e);
    }

    // 3. Look up community posts by this builder
    try {
      const targetId = builder?.id || id;
      const { data: postData } = await (supabase as any)
        .from("community_posts")
        .select("*")
        .or(`author_id.eq.${targetId},author->>id.eq.${targetId}`)
        .order("created_at", { ascending: false });

      if (Array.isArray(postData)) {
        posts = postData.map((row: any) => ({
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category || "General",
          author: row.author || {
            id: row.author_id || targetId,
            name: builder?.name || "Maker",
            handle: builder?.handle || "maker",
            avatar: builder?.avatar || "",
            role: builder?.role || "Maker",
          },
          likesCount: row.likes_count || 0,
          commentsCount: row.comments_count || 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at || row.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase community posts lookup error:", e);
    }
  }

  // 4. Fallback to serverStore if builder still not found
  if (!builder) {
    const shared = getSharedBuilders();
    const found = shared.find((b) => b.id === id || b.handle === id);
    if (found) {
      builder = found;
      const allProjects = getSharedProjects();
      projects = allProjects.filter((p) => p.author?.id === found.id || p.author?.handle === found.handle);
    }
  }

  if (builder) {
    builder.projectsCount = projects.length;
    builder.totalLikes = projects.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  }

  return { builder, projects, posts };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { builder } = await getBuilderData(id);

  if (!builder) {
    return {
      title: "빌더 프로필 | zemix",
      description: "zemix 사이드 프로젝트 메이커",
    };
  }

  const title = `${builder.name} (@${builder.handle}) | zemix 빌더`;
  const description =
    builder.bio || `${builder.name}님의 사이드 프로젝트와 제작 스토리를 zemix에서 확인하세요.`;
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(builder.name)}&tagline=${encodeURIComponent(builder.bio || "zemix 메이커 프로필")}&maker=${encodeURIComponent(builder.handle)}&type=builder`;

  return {
    title,
    description,
    keywords: [
      builder.name,
      builder.handle,
      builder.role,
      "zemix",
      "제믹스",
      "메이커",
      "빌더",
      "인디개발자",
      "사이드프로젝트",
    ],
    alternates: {
      canonical: `${SITE_URL}/builders/${builder.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/builders/${builder.id}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: builder.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default async function BuilderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { builder, projects, posts } = await getBuilderData(id);

  const dynamicOgImage = builder
    ? `${SITE_URL}/api/og?title=${encodeURIComponent(builder.name)}&tagline=${encodeURIComponent(builder.bio || "zemix 메이커 프로필")}&maker=${encodeURIComponent(builder.handle)}&type=builder`
    : `${SITE_URL}/og-image.png`;

  const jsonLd = builder
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: builder.name,
        alternateName: builder.handle,
        description: builder.bio,
        image: builder.avatar || dynamicOgImage,
        jobTitle: builder.role,
        url: `${SITE_URL}/builders/${builder.id}`,
        sameAs: [
          builder.socials?.website,
          builder.socials?.github ? `https://github.com/${builder.socials.github}` : undefined,
        ].filter(Boolean),
      }
    : null;

  const breadcrumbJsonLd = builder
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "zemix 홈",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "빌더들",
            item: `${SITE_URL}/builders`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: builder.name,
            item: `${SITE_URL}/builders/${builder.id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-6 py-16 animate-pulse">
            <div className="h-8 w-32 bg-surface-muted rounded mb-6" />
            <div className="rounded-card border border-border bg-surface p-8 h-48" />
          </div>
        }
      >
        <BuilderDetailClient
          builderId={id}
          initialBuilder={builder || undefined}
          initialProjects={projects}
          initialPosts={posts}
        />
      </Suspense>
    </>
  );
}
