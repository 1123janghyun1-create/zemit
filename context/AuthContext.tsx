"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Builder } from "@/lib/types";
import { getCurrentUser, setCurrentUser as storeCurrentUser, upsertBuilder, isUserBanned } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { isUserAdmin } from "@/lib/auth";

interface AuthContextType {
  user: Builder | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (updated: Builder) => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => ({ error: null }),
  logout: async () => {},
  updateUser: async () => {},
  isSupabaseConnected: true,
});

function getPersistentUserKey(userId: string): string {
  return `zemix_saved_profile_${userId}`;
}

function getPersistentUserProfile(userId: string): Builder | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(getPersistentUserKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function savePersistentUserProfile(user: Builder): void {
  if (typeof window === "undefined" || !user?.id) return;
  try {
    localStorage.setItem(getPersistentUserKey(user.id), JSON.stringify(user));
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);

  const syncUserFromSupabase = (sessionUser: any): Builder => {
    const meta = sessionUser.user_metadata || {};
    const email = sessionUser.email || "";
    const emailPrefix = email.split("@")[0] || "maker";
    
    // Support full Korean names, English names, nicknames without filtering out
    const fullName = meta.full_name || meta.name || emailPrefix;
    const avatar =
      meta.avatar_url ||
      meta.picture ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.id}`;
    const handle = (meta.user_name || emailPrefix).toLowerCase().replace(/[^a-z0-9_]/g, "") || "maker";
    const userIsAdmin = isUserAdmin({ id: sessionUser.id, handle, email } as any);

    const builder: Builder = {
      id: sessionUser.id,
      name: fullName,
      handle: handle,
      avatar: avatar,
      bio: meta.bio || "zemix 메이커",
      role: meta.role || "Maker",
      email: email,
      isAdmin: userIsAdmin,
      isStartingMember: true,
      socials: {
        website: meta.website,
        github: meta.preferred_username ? `https://github.com/${meta.preferred_username}` : undefined,
      },
    };

    return builder;
  };

  const loadUserProfile = async (sessionUser: any, supabaseClient: any): Promise<Builder> => {
    // 1. Check persistent user cache immediately (survives logout!)
    const persistentCache = getPersistentUserProfile(sessionUser.id);
    const activeLocal = getCurrentUser();
    const local = (activeLocal && activeLocal.id === sessionUser.id) ? activeLocal : persistentCache;

    // 2. Google OAuth raw fallback
    const rawFallback = syncUserFromSupabase(sessionUser);

    // 3. Fetch from Server API first (server-side query with admin privileges, avoids client-side RLS/timing issues)
    let serverProfile: any = null;
    try {
      const res = await fetch(`/api/builders/${sessionUser.id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id && !data.error) {
          serverProfile = data;
        }
      }
    } catch (e) {
      console.warn("Server builder profile query error:", e);
    }

    // 4. Fetch directly from Supabase profiles table on client as secondary source
    let dbProfile: any = null;
    try {
      if (supabaseClient) {
        const { data, error } = await (supabaseClient as any)
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (!error && data) {
          dbProfile = data;
        }
      }
    } catch (e) {
      console.warn("Profiles query error:", e);
    }

    // 5. Merge in order of authoritative preference:
    // Server Profile / DB Profile > Persistent Local Cache > Google Auth Metadata > Raw Fallback
    const meta = sessionUser.user_metadata || {};
    const profileSrc = serverProfile || dbProfile;

    const resolvedName =
      profileSrc?.name ||
      local?.name ||
      meta.full_name ||
      meta.name ||
      rawFallback.name;

    const resolvedHandle =
      profileSrc?.handle ||
      local?.handle ||
      meta.user_name ||
      rawFallback.handle;

    const resolvedAvatar =
      profileSrc?.avatar ||
      profileSrc?.avatar_url ||
      local?.avatar ||
      meta.avatar_url ||
      meta.picture ||
      rawFallback.avatar;

    // Bio: Preserve customized bio (never overwrite with default "zemix 메이커" if custom exists)
    let resolvedBio = "zemix 메이커";
    if (profileSrc?.bio && profileSrc.bio.trim() !== "") {
      resolvedBio = profileSrc.bio;
    } else if (local?.bio && local.bio.trim() !== "") {
      resolvedBio = local.bio;
    } else if (meta.bio && meta.bio.trim() !== "") {
      resolvedBio = meta.bio;
    }

    // Role: Preserve customized role (never overwrite with default "Maker" if custom exists)
    let resolvedRole = "Maker";
    if (profileSrc?.role && profileSrc.role.trim() !== "") {
      resolvedRole = profileSrc.role;
    } else if (local?.role && local.role.trim() !== "") {
      resolvedRole = local.role;
    } else if (meta.role && meta.role.trim() !== "") {
      resolvedRole = meta.role;
    }

    // Socials:
    const resolvedSocials = {
      github:
        profileSrc?.socials?.github ??
        profileSrc?.github_url ??
        local?.socials?.github ??
        (meta.preferred_username ? `https://github.com/${meta.preferred_username}` : ""),
      twitter:
        profileSrc?.socials?.twitter ??
        profileSrc?.twitter_url ??
        local?.socials?.twitter ??
        "",
      website:
        profileSrc?.socials?.website ??
        profileSrc?.website_url ??
        local?.socials?.website ??
        meta.website ??
        "",
    };

    const resolvedEmail = sessionUser.email || (local as any)?.email || "";
    const userIsAdmin = isUserAdmin({ id: sessionUser.id, handle: resolvedHandle, email: resolvedEmail } as any);

    const resolved: Builder = {
      id: sessionUser.id,
      name: resolvedName,
      handle: resolvedHandle,
      avatar: resolvedAvatar,
      bio: resolvedBio,
      role: resolvedRole,
      email: resolvedEmail,
      isAdmin: userIsAdmin,
      isBanned: profileSrc?.isBanned || profileSrc?.is_banned || isUserBanned(sessionUser.id) || (local ? local.isBanned : false) || false,
      isStartingMember: profileSrc?.isStartingMember ?? profileSrc?.is_starting_member ?? (local ? local.isStartingMember : true),
      followersCount: profileSrc?.followersCount ?? profileSrc?.followers_count ?? (local ? local.followersCount : 0),
      socials: resolvedSocials,
    };

    // 6. Save to active user state AND persistent cache
    setUser(resolved);
    storeCurrentUser(resolved);
    savePersistentUserProfile(resolved);
    upsertBuilder(resolved);

    // Only register to server API if the server didn't have this builder at all
    if (!serverProfile && !dbProfile) {
      try {
        fetch("/api/builders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resolved),
        }).catch(() => {});
      } catch {}
    }

    return resolved;
  };

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setIsSupabaseConnected(false);
      setUser(getCurrentUser());
      setLoading(false);
      return;
    }

    setIsSupabaseConnected(true);

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (session?.user) {
        await loadUserProfile(session.user, supabase);
      } else {
        setUser(null);
        storeCurrentUser(null);
      }
      setLoading(false);
    });

    // 2. Real-time auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user, supabase);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        storeCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (redirectPath?: string) => {
    const supabase = createClient();
    if (!supabase) {
      return { error: new Error("Supabase 클라이언트를 초기화할 수 없습니다.") };
    }

    const searchParams = new URLSearchParams();
    if (redirectPath && redirectPath.startsWith("/")) {
      searchParams.set("next", redirectPath);
    }
    const query = searchParams.toString();
    const redirectTo = `${window.location.origin}/auth/callback${query ? `?${query}` : ""}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (!error && data?.url) {
      window.location.href = data.url;
    }

    return { error };
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    storeCurrentUser(null);
    window.location.href = "/";
  };

  const updateUser = async (updated: Builder): Promise<void> => {
    setUser(updated);
    storeCurrentUser(updated);
    savePersistentUserProfile(updated);
    upsertBuilder(updated);

    // 1. Sync to server store via API
    try {
      await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn("API builder sync error:", e);
    }

    const supabase = createClient();
    if (supabase) {
      // 2. Update Supabase Auth user_metadata
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: updated.name,
            name: updated.name,
            user_name: updated.handle,
            avatar_url: updated.avatar,
            picture: updated.avatar,
            bio: updated.bio,
            role: updated.role,
            website: updated.socials?.website || null,
            github: updated.socials?.github || null,
          },
        });
      } catch (authErr) {
        console.warn("Auth updateUser error:", authErr);
      }

      // 3. Upsert into profiles table
      try {
        await (supabase as any).from("profiles").upsert({
          id: updated.id,
          name: updated.name,
          handle: updated.handle,
          avatar_url: updated.avatar,
          bio: updated.bio,
          role: updated.role,
          github_url: updated.socials?.github || null,
          website_url: updated.socials?.website || null,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn("Profiles update error:", profileErr);
      }

      // 4. Update author info across user's projects and community posts in Supabase
      try {
        await (supabase as any)
          .from("projects")
          .update({ author: updated })
          .eq("user_id", updated.id);
      } catch {}

      try {
        await (supabase as any)
          .from("community_posts")
          .update({ author: updated })
          .eq("author_id", updated.id);
      } catch {}
    }

    // 5. Dispatch global sync event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lumio_data_synced"));
    }
  };

  const isAdmin = isUserAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signInWithGoogle,
        logout,
        updateUser,
        isSupabaseConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
