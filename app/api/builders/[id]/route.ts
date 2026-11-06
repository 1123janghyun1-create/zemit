import { NextResponse } from "next/server";
import { getSharedBuilders } from "@/lib/serverStore";
import { getSupabase } from "@/lib/supabase/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing builder ID" }, { status: 400 });
    }

    const supabase = getSupabase();
    let builder: any = null;

    if (supabase) {
      try {
        // 1. Look up profiles by id or handle
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
      } catch (err) {
        console.warn("Supabase profile lookup error:", err);
      }

      // 2. If not found in profiles, inspect projects for author info
      if (!builder) {
        try {
          const { data: projects } = await (supabase as any)
            .from("projects")
            .select("author, user_id, likes_count")
            .or(`user_id.eq.${id},author->>id.eq.${id},author->>handle.eq.${id}`)
            .limit(1);

          if (Array.isArray(projects) && projects.length > 0 && projects[0].author) {
            const a = projects[0].author;
            builder = {
              id: a.id || projects[0].user_id || id,
              name: a.name || "Maker",
              handle: a.handle || "maker",
              avatar: a.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
              bio: a.bio || "zemix 메이커",
              role: a.role || "Maker",
              isStartingMember: a.isStartingMember ?? true,
              followersCount: a.followersCount || 0,
              isFollowing: false,
              projectsCount: 1,
              totalLikes: projects[0].likes_count || 0,
              socials: a.socials,
            };
          }
        } catch {}
      }

      // 3. Calculate project stats
      if (builder) {
        try {
          const targetId = builder.id;
          const { data: projs } = await (supabase as any)
            .from("projects")
            .select("likes_count")
            .or(`user_id.eq.${targetId},author->>id.eq.${targetId}`);

          if (Array.isArray(projs)) {
            builder.projectsCount = projs.length;
            builder.totalLikes = projs.reduce((acc: number, p: any) => acc + (p.likes_count || 0), 0);
          }
        } catch {}
      }
    }

    // 4. Fallback to serverStore
    if (!builder) {
      const allShared = getSharedBuilders();
      const found = allShared.find((b) => b.id === id || b.handle === id);
      if (found) {
        builder = found;
      }
    }

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    return NextResponse.json(builder);
  } catch (err: any) {
    console.error("GET /api/builders/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
