import { NextResponse } from "next/server";
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

export async function GET() {
  let projects: Project[] = [];

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (Array.isArray(data) && data.length > 0) {
        projects = data.map(rowToProject);
      }
    } catch {}
  }

  if (projects.length === 0) {
    projects = getSharedProjects();
  }

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>zemix — 사이드 프로젝트 메이커 커뮤니티</title>
    <link>${SITE_URL}</link>
    <description>새롭게 등록된 사이드 프로젝트와 메이커들의 프로덕트 런칭 소식</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${projects
      .map(
        (p) => `
    <item>
      <title>${escapeXml(p.title)} - ${escapeXml(p.tagline || "")}</title>
      <link>${SITE_URL}/projects/${p.id}</link>
      <guid>${SITE_URL}/projects/${p.id}</guid>
      ${p.websiteUrl ? `<source url="${escapeXml(p.websiteUrl)}">${escapeXml(p.title)} 공식 서비스 웹사이트</source>` : ""}
      <description>${escapeXml(p.description || p.tagline || p.title)}${p.websiteUrl ? ` - 공식 웹사이트: ${escapeXml(p.websiteUrl)}` : ""}</description>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <author>${escapeXml(p.author?.name || "zemix 메이커")}</author>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
