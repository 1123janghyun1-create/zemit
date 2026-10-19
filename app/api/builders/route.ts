import { NextResponse } from "next/server";
import { getSharedBuilders, upsertSharedBuilder, toggleSharedBuilderFollow } from "@/lib/serverStore";
import { createClient } from "@/lib/supabase/client";


export async function GET() {
  try {
    const localBuilders = getSharedBuilders();
    const builderMap = new Map<string, any>();
    localBuilders.forEach((b) => builderMap.set(b.id, { ...b, followersCount: b.followersCount ?? 0 }));

    // Also attempt Supabase profiles query if available
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any).from("profiles").select("*");
        if (!error && data && data.length > 0) {
          data.forEach((p: any) => {
            const existing = builderMap.get(p.id) || {};
            builderMap.set(p.id, {
              ...existing,
              id: p.id,
              name: p.name || existing.name || "Maker",
              handle: p.handle || existing.handle || "maker",
              avatar: p.avatar_url || existing.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
              bio: p.bio || existing.bio || "zemit 메이커",
              role: p.role || existing.role || "Maker",
              isStartingMember: p.is_starting_member ?? existing.isStartingMember ?? true,
              followersCount: existing.followersCount ?? 0,
              totalLikes: existing.totalLikes ?? 0,
              projectsCount: existing.projectsCount ?? 0,
              socials: {
                github: p.github_url || existing.socials?.github,
                twitter: p.twitter_url || existing.socials?.twitter,
                website: p.website_url || existing.socials?.website,
              },
            });
          });
        }
      }
    } catch {}

    const allBuilders = Array.from(builderMap.values());
    return NextResponse.json(allBuilders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { builderId, delta } = await req.json();
    if (!builderId || typeof delta !== "number") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }
    const result = toggleSharedBuilderFollow(builderId, delta);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const builder = await req.json();
    if (!builder || !builder.id) {
      return NextResponse.json({ error: "Invalid builder data" }, { status: 400 });
    }

    const saved = upsertSharedBuilder(builder);

    // Sync to Supabase profiles
    try {
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from("profiles").upsert({
          id: builder.id,
          name: builder.name,
          handle: builder.handle,
          avatar_url: builder.avatar,
          bio: builder.bio,
          role: builder.role,
          github_url: builder.socials?.github,
          website_url: builder.socials?.website,
          updated_at: new Date().toISOString(),
        });
      }
    } catch {}

    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
