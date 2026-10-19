import { NextResponse } from "next/server";
import {
  getSharedCommunityPosts,
  addSharedCommunityPost,
  deleteSharedCommunityPost,
} from "@/lib/serverStore";
import { createClient } from "@/lib/supabase/client";


export async function GET() {
  try {
    const posts = getSharedCommunityPosts();
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
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from("community_posts").insert({
          id: saved.id,
          category: saved.category,
          title: saved.title,
          content: saved.content,
          image_url: saved.imageUrl,
          author_id: saved.author.id,
          created_at: saved.createdAt,
        });
      }
    } catch {}

    return NextResponse.json(saved);
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
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from("community_posts").delete().eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
