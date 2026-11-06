import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/db";
import { getSharedProjectById, recordSharedProjectOutboundClick } from "@/lib/serverStore";

export const instant = false;

export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default async function GoProjectRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || id === "preview") {
    redirect("/");
  }

  let websiteUrl = "";
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("projects")
        .select("website_url")
        .eq("id", id)
        .maybeSingle();
      if (data?.website_url) websiteUrl = data.website_url;
    } catch {}
  }

  if (!websiteUrl) {
    const p = getSharedProjectById(id);
    if (p?.websiteUrl) websiteUrl = p.websiteUrl;
  }

  if (websiteUrl) {
    recordSharedProjectOutboundClick(id);
    redirect(websiteUrl);
  }

  redirect(`/projects/${id}`);
}
