import { NextResponse } from "next/server";
import {
  getSharedProjects,
  saveSharedProject,
  updateSharedProject,
  deleteSharedProject,
  recordSharedProjectView,
} from "@/lib/serverStore";
import { createClient } from "@/lib/supabase/client";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const viewId = searchParams.get("view");
    if (viewId) {
      recordSharedProjectView(viewId);
    }

    const projects = getSharedProjects();
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
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from("projects").insert({
          id: saved.id,
          title: saved.title,
          tagline: saved.tagline,
          description: saved.description,
          status: saved.status,
          cover_image: saved.coverImage,
          logo: saved.logo,
          author_id: saved.author.id,
          tags: saved.tags,
          created_at: saved.createdAt,
          updated_at: saved.updatedAt,
        });
      }
    } catch {}

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

    const updated = updateSharedProject(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Sync to Supabase if table exists
    try {
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from("projects").update({
          title: updated.title,
          tagline: updated.tagline,
          description: updated.description,
          status: updated.status,
          cover_image: updated.coverImage,
          logo: updated.logo,
          tags: updated.tags,
          updated_at: updated.updatedAt,
        }).eq("id", id);
      }
    } catch {}

    return NextResponse.json(updated);
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
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from("projects").delete().eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
