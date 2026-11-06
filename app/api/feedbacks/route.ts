import { NextResponse } from "next/server";
import {
  getSharedFeedbacks,
  addSharedFeedback,
  deleteSharedFeedback,
} from "@/lib/serverStore";
import { getSupabase } from "@/lib/supabase/db";
import { FeedbackItem } from "@/lib/types";

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
          .from("feedbacks")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const remote: FeedbackItem[] = data.map((r: any) => ({
            id: r.id,
            projectId: r.project_id,
            userId: r.user_id || "anonymous",
            userName: r.user_name || "익명",
            userAvatar: r.user_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + r.id,
            type: r.type || "idea",
            title: r.title,
            description: r.description || "",
            upvotes: r.upvotes || 1,
            status: r.status || "Open",
            createdAt: r.created_at,
            commentsCount: 0,
          }));
          return NextResponse.json(remote);
        }
      } catch {}
    }

    const feedbacks = getSharedFeedbacks(projectId);
    return NextResponse.json(feedbacks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const feedbackData = await req.json();
    if (!feedbackData || !feedbackData.projectId || (!feedbackData.description && !feedbackData.content && !feedbackData.title)) {
      return NextResponse.json({ error: "Missing feedback data" }, { status: 400 });
    }
    const saved = addSharedFeedback({
      ...feedbackData,
      description: feedbackData.description || feedbackData.content || "",
    });

    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("feedbacks").upsert({
          id: saved.id,
          project_id: saved.projectId,
          user_id: saved.userId,
          user_name: saved.userName,
          user_avatar: saved.userAvatar,
          type: saved.type,
          title: saved.title,
          description: saved.description,
          upvotes: saved.upvotes,
          status: saved.status,
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
      return NextResponse.json({ error: "Missing feedback id" }, { status: 400 });
    }
    deleteSharedFeedback(id);

    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("feedbacks").delete().eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
