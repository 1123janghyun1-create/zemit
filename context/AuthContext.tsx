"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Builder } from "@/lib/types";
import { getCurrentUser, setCurrentUser as storeCurrentUser, upsertBuilder } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: Builder | null;
  loading: boolean;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (updated: Builder) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ error: null }),
  logout: async () => {},
  updateUser: () => {},
  isSupabaseConnected: true,
});

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

    const builder: Builder = {
      id: sessionUser.id,
      name: fullName,
      handle: handle,
      avatar: avatar,
      bio: meta.bio || "zemit 메이커",
      role: meta.role || "Maker",
      isStartingMember: true,
      socials: {
        website: meta.website,
        github: meta.preferred_username ? `https://github.com/${meta.preferred_username}` : undefined,
      },
    };

    return builder;
  };

  const loadUserProfile = async (sessionUser: any, supabaseClient: any): Promise<Builder> => {
    // 1. Google OAuth / raw auth fallback
    const rawFallback = syncUserFromSupabase(sessionUser);

    // 2. Check localStorage for currently stored user
    const local = getCurrentUser();
    let current: Builder = (local && local.id === sessionUser.id)
      ? { ...rawFallback, ...local }
      : rawFallback;

    // 3. Query Supabase profiles table
    try {
      if (supabaseClient) {
        const { data, error } = await (supabaseClient as any)
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (!error && data) {
          current = {
            ...current,
            name: data.name || current.name,
            handle: data.handle || current.handle,
            avatar: data.avatar_url || current.avatar,
            bio: data.bio !== null && data.bio !== undefined ? data.bio : current.bio,
            role: data.role || current.role,
            isStartingMember: data.is_starting_member ?? current.isStartingMember,
            socials: {
              ...current.socials,
              github: data.github_url || current.socials?.github,
              twitter: data.twitter_url || current.socials?.twitter,
              website: data.website_url || current.socials?.website,
            },
          };
        }
      }
    } catch (e) {
      console.warn("Profiles query error:", e);
    }

    // 4. Query server store via /api/builders to check if there is an existing builder on disk
    try {
      const res = await fetch("/api/builders", { cache: "no-store" });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          const found = list.find((b: any) => b.id === sessionUser.id);
          if (found) {
            current = {
              ...found,
              ...current,
              followersCount: found.followersCount ?? current.followersCount ?? 0,
            };
          }
        }
      }
    } catch {}

    setUser(current);
    storeCurrentUser(current);
    upsertBuilder(current);
    return current;
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

  const updateUser = async (updated: Builder) => {
    setUser(updated);
    storeCurrentUser(updated);
    upsertBuilder(updated);

    const supabase = createClient();
    if (supabase) {
      // 1. Update Supabase Auth user_metadata
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
            website: updated.socials?.website,
            github: updated.socials?.github,
          },
        });
      } catch (authErr) {
        console.warn("Auth updateUser error:", authErr);
      }

      // 2. Upsert into profiles table
      try {
        await (supabase as any).from("profiles").upsert({
          id: updated.id,
          name: updated.name,
          handle: updated.handle,
          avatar_url: updated.avatar,
          bio: updated.bio,
          role: updated.role,
          github_url: updated.socials?.github,
          website_url: updated.socials?.website,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn("Profiles update error:", profileErr);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
