import { NextResponse } from "next/server";
import {
  getSharedProjects,
  getSharedProjectById,
  saveSharedProject,
  updateSharedProject,
  deleteSharedProject,
  recordSharedProjectView,
  recordSharedProjectOutboundClick,
  toggleSharedProjectLike,
} from "@/lib/serverStore";
import { getSupabase, projectToRow, rowToProject } from "@/lib/supabase/db";
import { Project } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const viewId = searchParams.get("view");
    const currentUserId = searchParams.get("currentUserId") || undefined;
    const supabase = getSupabase();
    if (viewId) {
      recordSharedProjectView(viewId);
      if (supabase) {
        try {
          const { data: cur } = await (supabase as any)
            .from("projects")
            .select("views_count")
            .eq("id", viewId)
            .maybeSingle();
          if (cur) {
            await (supabase as any)
              .from("projects")
              .update({ views_count: (cur.views_count || 0) + 1 })
              .eq("id", viewId);
          }
        } catch (vErr) {
          console.warn("Supabase view increment warning:", vErr);
        }
      }
    }
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const localProjects = getSharedProjects(currentUserId);
          const localLikesMap = new Map<string, Project>();
          localProjects.forEach((lp) => localLikesMap.set(lp.id, lp));

          const remoteProjects = data.map((row: any) => {
            const p = rowToProject(row);
            const remoteLiked: string[] = Array.isArray(row.insights?.likedUserIds)
              ? row.insights.likedUserIds
              : [];
            const localProj = localLikesMap.get(p.id);
            const localIsLiked = localProj?.isLiked ?? false;
            const isLiked = currentUserId
              ? (remoteLiked.includes(currentUserId) || localIsLiked)
              : false;
            const likesCount = Math.max(
              remoteLiked.length,
              row.likes_count || 0,
              localProj?.likesCount || 0
            );

            return {
              ...p,
              isLiked,
              likesCount,
            };
          });

          // Resilient merge with local serverStore
          const map = new Map<string, Project>();
          remoteProjects.forEach((p) => map.set(p.id, p));
          localProjects.forEach((lp) => {
            if (!map.has(lp.id)) {
              map.set(lp.id, lp);
            }
          });
          return NextResponse.json(Array.from(map.values()));
        }
      } catch (dbErr) {
        console.warn("Supabase projects fetch error, fallback to store:", dbErr);
      }
    }

    // 2. Fallback to local serverStore
    const projects = getSharedProjects(currentUserId);
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const projectData = await req.json();
    if (!projectData || !projectData.title) {
      return NextResponse.json({ error: "Missing project title" }, { status: 400 });
    }

    const saved = saveSharedProject(projectData);

    // Sync to Supabase projects if table exists
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("projects").upsert(projectToRow(saved));
      }
    } catch (e) {
      console.warn("Supabase project insert error:", e);
    }

    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const supabase = getSupabase();
    let existingProject: Project | null = null;

    // 1. Check Supabase first for the latest record
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) {
          existingProject = rowToProject(data);
        }
      } catch (err) {
        console.warn("Supabase fetch before project update error:", err);
      }
    }

    // 2. Fallback to local serverStore
    if (!existingProject) {
      existingProject = getSharedProjectById(id) || null;
    }

    if (!existingProject && !updates?.title) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const mergedProject: Project = {
      ...(existingProject || ({} as Project)),
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    // 3. Update local serverStore (memory / json)
    const inStore = updateSharedProject(id, updates);
    if (!inStore) {
      saveSharedProject(mergedProject);
    }

    // 4. Upsert to Supabase
    if (supabase) {
      try {
        const row = projectToRow(mergedProject);
        const { error: upsertErr } = await supabase.from("projects").upsert(row);
        if (upsertErr) {
          console.warn("Supabase project upsert warning:", upsertErr);
        }
      } catch (dbErr) {
        console.warn("Supabase project update warning:", dbErr);
      }
    }

    return NextResponse.json(mergedProject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, action, userId } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    if (action === "outboundClick") {
      recordSharedProjectOutboundClick(id);
      return NextResponse.json({ success: true, id });
    }

    // Default action: toggle like
    const supabase = getSupabase();
    let existingInsights: any = {};
    let remoteLikedIds: string[] = [];

    if (supabase) {
      try {
        const { data: existingProj } = await supabase
          .from("projects")
          .select("insights, likes_count")
          .eq("id", id)
          .maybeSingle();
        if (existingProj) {
          existingInsights = existingProj.insights || {};
          if (Array.isArray(existingInsights.likedUserIds)) {
            remoteLikedIds = existingInsights.likedUserIds;
          }
        }
      } catch {}
    }

    const result = toggleSharedProjectLike(id, userId, remoteLikedIds);

    // Sync like count and liked users to Supabase
    if (supabase) {
      try {
        await supabase
          .from("projects")
          .update({
            likes_count: result.likesCount,
            insights: {
              ...existingInsights,
              likedUserIds: result.likedUserIds,
            },
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase project like sync warning:", err);
      }
    }

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
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    deleteSharedProject(id);

    // Sync to Supabase if table exists
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("projects").delete().eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
