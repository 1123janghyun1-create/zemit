import { NextResponse } from "next/server";
import {
  getSharedComments,
  addSharedComment,
  deleteSharedComment,
} from "@/lib/serverStore";
import { getSupabase } from "@/lib/supabase/db";
import { CommentItem } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const remote: CommentItem[] = data.map((r: any) => ({
            id: r.id,
            projectId: r.project_id,
            userId: r.user_id || "anonymous",
            userName: r.user_name || "익명",
            userAvatar: r.user_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + r.id,
            content: r.content,
            likes: r.likes || 0,
            createdAt: r.created_at,
          }));
          return NextResponse.json(remote);
        }
      } catch {}
    }

    const comments = getSharedComments(projectId);
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const commentData = await req.json();
    if (!commentData || !commentData.projectId || !commentData.content) {
      return NextResponse.json({ error: "Missing comment data" }, { status: 400 });
    }
    const saved = addSharedComment(commentData);

    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("comments").upsert({
          id: saved.id,
          project_id: saved.projectId,
          user_id: saved.userId,
          user_name: saved.userName,
          user_avatar: saved.userAvatar,
          content: saved.content,
          likes: saved.likes,
          created_at: saved.createdAt,
        });

        // Sync count to community_posts and projects
        const { count: cCount } = await (supabase as any)
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("project_id", saved.projectId);

        if (cCount !== null && cCount !== undefined) {
          await (supabase as any).from("projects").update({ comments_count: cCount }).eq("id", saved.projectId);
          await (supabase as any).from("community_posts").update({ comments_count: cCount }).eq("id", saved.projectId);
        }
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
    let targetProjectId = searchParams.get("projectId");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
      if (!targetProjectId) targetProjectId = body?.projectId;
    }
    if (!id) {
      return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
    }
    deleteSharedComment(id);

    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("comments").delete().eq("id", id);
        if (targetProjectId) {
          const { count: cCount } = await (supabase as any)
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("project_id", targetProjectId);

          if (cCount !== null && cCount !== undefined) {
            await (supabase as any).from("projects").update({ comments_count: cCount }).eq("id", targetProjectId);
            await (supabase as any).from("community_posts").update({ comments_count: cCount }).eq("id", targetProjectId);
          }
        }
      }
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
