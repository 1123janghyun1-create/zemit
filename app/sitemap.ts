import { MetadataRoute } from "next";
import { getSharedProjects, getSharedCommunityPosts } from "@/lib/serverStore";
import { getSupabase, rowToProject } from "@/lib/supabase/db";
import { Project } from "@/lib/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://zemix.vercel.app");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projects: Project[] = getSharedProjects();
  let builders: { id: string; updatedAt?: string }[] = [];
  let communityPosts: { id: string; createdAt?: string }[] = [];

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: prjs } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (Array.isArray(prjs) && prjs.length > 0) {
        projects = prjs.map(rowToProject);
      }
    } catch {}

    try {
      const { data: profs } = await (supabase as any)
        .from("profiles")
        .select("id, updated_at");

      if (Array.isArray(profs)) {
        builders = profs
          .filter((p: any) => !p.id.startsWith("builder-"))
          .map((p: any) => ({ id: p.id, updatedAt: p.updated_at }));
      }
    } catch {}

    try {
      const { data: posts } = await supabase
        .from("community_posts")
        .select("id, created_at");

      if (Array.isArray(posts)) {
        communityPosts = posts.map((cp: any) => ({
          id: cp.id,
          createdAt: cp.created_at,
        }));
      }
    } catch {}
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/builders`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/upcoming`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ideas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic project routes for Googlebot crawling
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  }));

  // Dynamic builder profile routes
  const builderRoutes: MetadataRoute.Sitemap = builders.map((b) => ({
    url: `${SITE_URL}/builders/${b.id}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic community post routes
  const communityRoutes: MetadataRoute.Sitemap = communityPosts.map((cp) => ({
    url: `${SITE_URL}/community?post=${cp.id}`,
    lastModified: cp.createdAt ? new Date(cp.createdAt) : new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...builderRoutes, ...communityRoutes];
}
