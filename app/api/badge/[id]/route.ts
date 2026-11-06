import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/db";
import { getSharedProjectById } from "@/lib/serverStore";

export const instant = false;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let title = "zemix";
  let likes = 0;
  let views = 0;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("projects")
        .select("title, likes_count, views_count")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        title = data.title || "zemix";
        likes = data.likes_count || 0;
        views = data.views_count || 0;
      }
    } catch {}
  }

  if (title === "zemix") {
    const p = getSharedProjectById(id);
    if (p) {
      title = p.title;
      likes = p.likesCount || 0;
      views = p.viewsCount || 0;
    }
  }

  // Generate GitHub-style dynamic SVG badge
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" viewBox="0 0 220 28" fill="none">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
    </defs>
    <rect width="220" height="28" rx="6" fill="url(#bgGrad)" stroke="#334155" stroke-width="1"/>
    
    <!-- Left brand pill -->
    <rect x="1" y="1" width="70" height="26" rx="5" fill="url(#brandGrad)" />
    <text x="36" y="18" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">zemix</text>

    <!-- Center & Right stats -->
    <text x="110" y="18" fill="#f43f5e" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">❤️ ${likes}</text>
    <text x="170" y="18" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">👀 ${views}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
