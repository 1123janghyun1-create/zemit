import { NextResponse } from "next/server";
import {
  getSharedCommunityPosts,
  addSharedCommunityPost,
  deleteSharedCommunityPost,
  toggleSharedCommunityLike,
} from "@/lib/serverStore";
import { getSupabase, postToRow, rowToPost } from "@/lib/supabase/db";
import { CommunityPost } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentUserId = searchParams.get("currentUserId") || undefined;

    // 1. Try Supabase first
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("community_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const localPosts = getSharedCommunityPosts(currentUserId);
          const localMap = new Map<string, CommunityPost>();
          localPosts.forEach((lp) => localMap.set(lp.id, lp));

          const remotePosts = data.map((row: any) => {
            const p = rowToPost(row);
            const localPost = localMap.get(p.id);
            const isLiked = localPost?.isLiked ?? false;
            const likesCount = Math.max(row.likes_count || 0, localPost?.likesCount || 0);
            return {
              ...p,
              isLiked,
              likesCount,
            };
          });

          const map = new Map<string, CommunityPost>();
          remotePosts.forEach((p) => map.set(p.id, p));
          localPosts.forEach((lp) => {
            if (!map.has(lp.id)) {
              map.set(lp.id, lp);
            }
          });
          return NextResponse.json(Array.from(map.values()));
        }
      } catch (dbErr) {
        console.warn("Supabase community fetch error, fallback to store:", dbErr);
      }
    }

    // 2. Fallback to local serverStore
    const posts = getSharedCommunityPosts(currentUserId);
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const postData = await req.json();
    if (!postData || !postData.title || !postData.content) {
      return NextResponse.json({ error: "Missing required post fields" }, { status: 400 });
    }

    const saved = addSharedCommunityPost(postData);

    // Sync to Supabase if table exists
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("community_posts").upsert(postToRow(saved));
      }
    } catch {}

    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, userId } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const result = toggleSharedCommunityLike(id, userId);

    // Sync like count to Supabase
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from("community_posts")
          .update({ likes_count: result.likesCount })
          .eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, id, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    deleteSharedCommunityPost(id);

    // Sync to Supabase if table exists
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("community_posts").delete().eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
