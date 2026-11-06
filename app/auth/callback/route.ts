import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/";

  if (error) {
    console.error("Auth callback error received:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError && data?.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata || {};
        const email = u.email || "";
        const emailPrefix = email.split("@")[0] || "maker";
        const fullName = meta.full_name || meta.name || emailPrefix;
        const handle = (meta.user_name || emailPrefix).toLowerCase().replace(/[^a-z0-9_]/g, "") || "maker";
        const avatar = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`;

        // Ensure newly logged-in user is registered into Supabase profiles table without overwriting existing data
        try {
          const { data: existingProfile } = await (supabase as any)
            .from("profiles")
            .select("id")
            .eq("id", u.id)
            .maybeSingle();

          if (existingProfile) {
            // Profile ALREADY exists: never overwrite customized bio, role, handle, name, socials!
            await (supabase as any).from("profiles").update({
              updated_at: new Date().toISOString(),
            }).eq("id", u.id);
          } else {
            // First time login: insert initial record
            await (supabase as any).from("profiles").insert({
              id: u.id,
              name: fullName,
              handle: handle,
              avatar_url: avatar,
              bio: "zemix 메이커",
              role: "Maker",
              is_starting_member: true,
              github_url: meta.preferred_username ? `https://github.com/${meta.preferred_username}` : null,
              website_url: meta.website || null,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (dbErr) {
          console.warn("Auth callback profiles safe register error:", dbErr);
        }

        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
      console.error("Auth callback exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError?.message || "auth_failed")}`, requestUrl.origin)
      );
    }
  }

  // If code is missing or exchange failed, redirect with error
  return NextResponse.redirect(new URL(`/login?error=auth_failed`, requestUrl.origin));
}
