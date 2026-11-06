"use client";

import {
  INITIAL_PROJECTS,
  INITIAL_BUILDERS,
  INITIAL_FEEDBACKS,
  INITIAL_COMMENTS,
  INITIAL_TIMELINE,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_NOTIFICATIONS,
} from "./mockData";
import {
  Project,
  Builder,
  FeedbackItem,
  CommentItem,
  TimelineUpdate,
  CommunityPost,
  NotificationItem,
} from "./types";

const STORAGE_KEYS = {
  PROJECTS: "lumio_clean_projects",
  BUILDERS: "zemix_clean_builders_v3",
  FEEDBACKS: "lumio_clean_feedbacks",
  COMMENTS: "lumio_clean_comments",
  TIMELINE: "lumio_clean_timeline",
  COMMUNITY: "lumio_clean_community",
  NOTIFICATIONS: "lumio_clean_notifications",
  CURRENT_USER: "lumio_clean_current_user",
  LIKED_PROJECT_IDS: "lumio_clean_liked_projects",
  LIKED_COMMUNITY_IDS: "lumio_clean_liked_community",
  UPVOTED_FEEDBACK_IDS: "lumio_clean_upvoted_feedbacks",
  FOLLOWED_BUILDER_IDS: "lumio_clean_followed_builders",
  BANNED_USER_IDS: "zemix_banned_user_ids",
};

// Purge legacy mock data in browser
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("lumio_clean_builders");
    localStorage.removeItem("lumio_clean_builders_v2");
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("cozit_") || k.startsWith("lumio_v2_") || k.startsWith("lumio_liked") || k.startsWith("lumio_upvoted") || k.startsWith("lumio_followed"))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// -------------------------------------------------------------
// Shared Server Synchronization (All devices / users see same data)
// -------------------------------------------------------------
export async function syncAllWithServer(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const [pRes, bRes, cRes] = await Promise.allSettled([
      fetch("/api/projects", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/builders", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/community", { cache: "no-store" }).then((r) => r.json()),
    ]);

    let changed = false;

    // Resilient Projects sync
    if (pRes.status === "fulfilled" && Array.isArray(pRes.value)) {
      const localProjects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
      const likedIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_PROJECT_IDS, []);
      const map = new Map<string, Project>();
      localProjects.forEach((p) => map.set(p.id, p));

      const serverIds = new Set<string>();
      pRes.value.forEach((sp: Project) => {
        serverIds.add(sp.id);
        const existing = map.get(sp.id);
        const isLiked = likedIds.includes(sp.id) || existing?.isLiked || sp.isLiked || false;
        map.set(sp.id, {
          ...existing,
          ...sp,
          isLiked,
          likesCount: Math.max(existing?.likesCount ?? 0, sp.likesCount ?? 0, isLiked ? 1 : 0),
          viewsCount: Math.max(existing?.viewsCount ?? 0, sp.viewsCount ?? 0),
          commentsCount: Math.max(existing?.commentsCount ?? 0, sp.commentsCount ?? 0),
          feedbacksCount: Math.max(existing?.feedbacksCount ?? 0, sp.feedbacksCount ?? 0),
        });
      });

      // Re-seed server if server restarted and lost local user projects
      localProjects.forEach((lp) => {
        if (!serverIds.has(lp.id)) {
          fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lp),
          }).catch(() => {});
        }
      });

      setStoredItem(STORAGE_KEYS.PROJECTS, Array.from(map.values()));
      changed = true;
    }

    // Resilient Builders sync (Server is single source of truth for real logged-in users)
    if (bRes.status === "fulfilled" && Array.isArray(bRes.value)) {
      setStoredItem(STORAGE_KEYS.BUILDERS, bRes.value);
      changed = true;
    }

    // Resilient Community sync
    if (cRes.status === "fulfilled" && Array.isArray(cRes.value)) {
      const localPosts = getStoredItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, []);
      const likedCommunityIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_COMMUNITY_IDS, []);
      const map = new Map<string, CommunityPost>();
      localPosts.forEach((p) => map.set(p.id, p));

      const serverIds = new Set<string>();
      cRes.value.forEach((sp: CommunityPost) => {
        serverIds.add(sp.id);
        const existing = map.get(sp.id);
        const isLiked = likedCommunityIds.includes(sp.id) || existing?.isLiked || sp.isLiked || false;
        map.set(sp.id, {
          ...existing,
          ...sp,
          isLiked,
          likesCount: Math.max(existing?.likesCount ?? 0, sp.likesCount ?? 0, isLiked ? 1 : 0),
          commentsCount: Math.max(existing?.commentsCount ?? 0, sp.commentsCount ?? 0),
        });
      });

      localPosts.forEach((lp) => {
        if (!serverIds.has(lp.id)) {
          fetch("/api/community", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lp),
          }).catch(() => {});
        }
      });

      setStoredItem(STORAGE_KEYS.COMMUNITY, Array.from(map.values()));
      changed = true;
    }

    if (changed) {
      window.dispatchEvent(new CustomEvent("lumio_data_synced"));
    }
  } catch (err) {
    console.warn("Storage sync error:", err);
  }
}

export async function fetchSharedProjects(currentUserId?: string): Promise<Project[]> {
  try {
    const url = currentUserId
      ? `/api/projects?currentUserId=${encodeURIComponent(currentUserId)}`
      : `/api/projects`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const localProjects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
        const likedIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_PROJECT_IDS, []);
        const map = new Map<string, Project>();
        localProjects.forEach((p) => map.set(p.id, p));

        const serverIds = new Set<string>();
        data.forEach((sp: Project) => {
          serverIds.add(sp.id);
          const existing = map.get(sp.id);
          const isLiked = likedIds.includes(sp.id) || existing?.isLiked || sp.isLiked || false;

          const localTime = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          const serverTime = sp?.updatedAt ? new Date(sp.updatedAt).getTime() : 0;
          const base = (existing && localTime > serverTime) ? { ...sp, ...existing } : { ...existing, ...sp };

          map.set(sp.id, {
            ...base,
            isLiked,
            likesCount: Math.max(existing?.likesCount ?? 0, sp.likesCount ?? 0, isLiked ? 1 : 0),
            viewsCount: Math.max(existing?.viewsCount ?? 0, sp.viewsCount ?? 0),
            commentsCount: Math.max(existing?.commentsCount ?? 0, sp.commentsCount ?? 0),
            feedbacksCount: Math.max(existing?.feedbacksCount ?? 0, sp.feedbacksCount ?? 0),
          });
        });

        // Re-push local-only projects if server restarted
        localProjects.forEach((lp) => {
          if (!serverIds.has(lp.id)) {
            fetch("/api/projects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(lp),
            }).catch(() => {});
          }
        });

        const merged = Array.from(map.values());
        setStoredItem(STORAGE_KEYS.PROJECTS, merged);

        const serverLikedIds = data.filter((p: any) => p.isLiked).map((p: any) => p.id);
        const mergedLiked = Array.from(new Set([...likedIds, ...serverLikedIds]));
        setStoredItem(STORAGE_KEYS.LIKED_PROJECT_IDS, mergedLiked);

        const followedIds = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
        return merged.map((p) => {
          const isLiked = p.isLiked || mergedLiked.includes(p.id);
          return {
            ...p,
            isLiked,
            likesCount: Math.max(p.likesCount ?? 0, isLiked ? 1 : 0),
            author: p.author
              ? {
                  ...p.author,
                  isFollowing: p.author.isFollowing || followedIds.includes(p.author.id),
                }
              : p.author,
          };
        });
      }
    }
  } catch {}
  return getProjects();
}

export async function fetchSharedBuilders(currentUserId?: string): Promise<Builder[]> {
  try {
    const url = currentUserId
      ? `/api/builders?currentUserId=${encodeURIComponent(currentUserId)}`
      : `/api/builders`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const followedIds = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
        const serverFollowedIds = data.filter((b: any) => b.isFollowing).map((b: any) => b.id);
        const mergedFollowed = Array.from(new Set([...followedIds, ...serverFollowedIds]));
        setStoredItem(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, mergedFollowed);

        const formatted: Builder[] = data.map((b: any) => {
          const isFollowing = b.isFollowing || mergedFollowed.includes(b.id);
          return {
            ...b,
            isFollowing,
            followersCount: Math.max(b.followersCount ?? 0, isFollowing ? 1 : 0),
          };
        });

        setStoredItem(STORAGE_KEYS.BUILDERS, formatted);
        return formatted;
      }
    }
  } catch {}
  return getBuilders();
}

export async function fetchSharedCommunityPosts(currentUserId?: string): Promise<CommunityPost[]> {
  try {
    const url = currentUserId
      ? `/api/community?currentUserId=${encodeURIComponent(currentUserId)}`
      : `/api/community`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const localPosts = getStoredItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, []);
        const map = new Map<string, CommunityPost>();
        localPosts.forEach((p) => map.set(p.id, p));

        const serverIds = new Set<string>();
        data.forEach((sp: CommunityPost) => {
          serverIds.add(sp.id);
          const existing = map.get(sp.id);
          map.set(sp.id, {
            ...existing,
            ...sp,
            likesCount: Math.max(existing?.likesCount ?? 0, sp.likesCount ?? 0),
            commentsCount: Math.max(existing?.commentsCount ?? 0, sp.commentsCount ?? 0),
          });
        });

        localPosts.forEach((lp) => {
          if (!serverIds.has(lp.id)) {
            fetch("/api/community", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(lp),
            }).catch(() => {});
          }
        });

        const merged = Array.from(map.values());
        setStoredItem(STORAGE_KEYS.COMMUNITY, merged);

        const likedPostIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_COMMUNITY_IDS, []);
        const serverLiked = data.filter((p: any) => p.isLiked).map((p: any) => p.id);
        const mergedLiked = Array.from(new Set([...likedPostIds, ...serverLiked]));
        setStoredItem(STORAGE_KEYS.LIKED_COMMUNITY_IDS, mergedLiked);

        return merged.map((p) => {
          const isLiked = p.isLiked || mergedLiked.includes(p.id);
          return {
            ...p,
            isLiked,
            likesCount: Math.max(p.likesCount ?? 0, isLiked ? 1 : 0),
          };
        });
      }
    }
  } catch {}
  return getCommunityPosts();
}

// Auto sync on client load and window focus
if (typeof window !== "undefined") {
  syncAllWithServer();
  window.addEventListener("focus", () => syncAllWithServer());
}

// Current User State
export function getCurrentUser(): Builder | null {
  return getStoredItem<Builder | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: Builder | null): void {
  setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
}

// Projects
export function getProjects(): Project[] {
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const likedIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_PROJECT_IDS, []);
  const followedIds = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
  return projects.map((p) => {
    const isLiked = likedIds.includes(p.id);
    return {
      ...p,
      isLiked,
      likesCount: Math.max(p.likesCount ?? 0, isLiked ? 1 : 0),
      author: p.author
        ? {
            ...p.author,
            isFollowing: followedIds.includes(p.author.id),
          }
        : p.author,
    };
  });
}

export function getProjectById(id: string): Project | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

export function isProjectLiked(projectId: string): boolean {
  if (!projectId) return false;
  const likedIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_PROJECT_IDS, []);
  return likedIds.includes(projectId);
}

export function saveProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "likesCount" | "viewsCount" | "commentsCount" | "feedbacksCount" | "followersCount">): Project {
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const newProject: Project = {
    ...projectData,
    id: `proj-${Date.now()}`,
    likesCount: 0,
    viewsCount: 1,
    commentsCount: 0,
    feedbacksCount: 0,
    followersCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newProject, ...projects];
  setStoredItem(STORAGE_KEYS.PROJECTS, updated);

  // Sync to server & Supabase
  if (typeof window !== "undefined") {
    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    }).catch((e) => console.warn("Failed to sync project to server:", e));
  }

  return newProject;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
  baseProject?: Project
): Promise<Project | null> {
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  let updatedProject: Project | null = null;
  let found = false;
  const nowIso = new Date().toISOString();

  const updatedProjects = projects.map((p) => {
    if (p.id === id) {
      found = true;
      updatedProject = {
        ...p,
        ...updates,
        updatedAt: nowIso,
      };
      return updatedProject;
    }
    return p;
  });

  if (!found && baseProject) {
    updatedProject = {
      ...baseProject,
      ...updates,
      id,
      updatedAt: nowIso,
    };
    updatedProjects.unshift(updatedProject);
  }

  if (updatedProject) {
    setStoredItem(STORAGE_KEYS.PROJECTS, updatedProjects);
  }

  // Sync to server & Supabase
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.id) {
          updatedProject = {
            ...(updatedProject || {}),
            ...serverData,
          };
          const curProjects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
          const syncedProjects = curProjects.map((p) =>
            p.id === id ? { ...p, ...serverData } : p
          );
          if (!syncedProjects.some((p) => p.id === id)) {
            syncedProjects.unshift(serverData);
          }
          setStoredItem(STORAGE_KEYS.PROJECTS, syncedProjects);
        }
      }
    } catch (e) {
      console.warn("Failed to sync project update:", e);
    }

    try {
      window.dispatchEvent(
        new CustomEvent("lumio_data_synced", {
          detail: { projectId: id, action: "update" },
        })
      );
    } catch {}
  }
  return updatedProject;
}

export function deleteProject(id: string): boolean {
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const remaining = projects.filter((p) => p.id !== id);
  setStoredItem(STORAGE_KEYS.PROJECTS, remaining);

  // Clean up associated feedbacks, comments, timeline
  const feedbacks = getStoredItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
  setStoredItem(STORAGE_KEYS.FEEDBACKS, feedbacks.filter((f) => f.projectId !== id));

  const comments = getStoredItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  setStoredItem(STORAGE_KEYS.COMMENTS, comments.filter((c) => c.projectId !== id));

  const timeline = getStoredItem<TimelineUpdate[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  setStoredItem(STORAGE_KEYS.TIMELINE, timeline.filter((t) => t.projectId !== id));

  // Sync to server & Supabase
  if (typeof window !== "undefined") {
    fetch(`/api/projects?id=${id}`, { method: "DELETE" }).catch((e) =>
      console.warn("Failed to sync project deletion:", e)
    );
    try {
      window.dispatchEvent(
        new CustomEvent("lumio_data_synced", {
          detail: { projectId: id, action: "delete" },
        })
      );
    } catch {}
  }

  return true;
}

export function toggleProjectLike(projectId: string, userId?: string): { likesCount: number; isLiked: boolean } {
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const likedIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_PROJECT_IDS, []);
  
  const isCurrentlyLiked = likedIds.includes(projectId);
  const nextLiked = !isCurrentlyLiked;
  const newLikedIds = isCurrentlyLiked
    ? likedIds.filter((id) => id !== projectId)
    : [...likedIds, projectId];

  setStoredItem(STORAGE_KEYS.LIKED_PROJECT_IDS, newLikedIds);

  let newLikesCount = nextLiked ? 1 : 0;
  let found = false;
  const updatedProjects = projects.map((p) => {
    if (p.id === projectId) {
      found = true;
      const delta = isCurrentlyLiked ? -1 : 1;
      newLikesCount = Math.max(0, (p.likesCount || 0) + delta);
      return { ...p, likesCount: newLikesCount, isLiked: nextLiked };
    }
    return p;
  });

  if (found) {
    setStoredItem(STORAGE_KEYS.PROJECTS, updatedProjects);
  }

  // Dispatch instant event for active cards & detail pages
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("lumio_like_changed", {
        detail: { projectId, likesCount: newLikesCount, isLiked: nextLiked },
      })
    );
  }

  // Sync to server
  if (typeof window !== "undefined") {
    fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, action: "like", userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.likesCount === "number") {
          const curLiked = getStoredItem<string[]>(STORAGE_KEYS.LIKED_PROJECT_IDS, []);
          const isNowLiked = curLiked.includes(projectId);
          const finalCount = Math.max(data.likesCount, isNowLiked ? 1 : 0);

          const curProjects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
          const synced = curProjects.map((p) =>
            p.id === projectId ? { ...p, likesCount: finalCount, isLiked: isNowLiked } : p
          );
          setStoredItem(STORAGE_KEYS.PROJECTS, synced);
          window.dispatchEvent(new CustomEvent("lumio_data_synced"));
        }
      })
      .catch(() => {});
  }

  return { likesCount: newLikesCount, isLiked: nextLiked };
}

export function recordProjectView(projectId: string): void {
  if (typeof window === "undefined" || !projectId) return;

  // Prevent multiple rapid calls within 3 seconds for the same project
  try {
    const lastViewKey = `last_view_${projectId}`;
    const lastViewTime = Number(sessionStorage.getItem(lastViewKey) || "0");
    const now = Date.now();
    if (now - lastViewTime < 3000) {
      return; // Deduplicate calls within 3 seconds
    }
    sessionStorage.setItem(lastViewKey, String(now));
  } catch {}

  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const updated = projects.map((p) => {
    if (p.id === projectId) {
      return { ...p, viewsCount: (p.viewsCount || 0) + 1 };
    }
    return p;
  });
  setStoredItem(STORAGE_KEYS.PROJECTS, updated);

  fetch(`/api/projects?view=${encodeURIComponent(projectId)}`, { cache: "no-store" }).catch(() => {});
}

export function recordProjectOutboundClick(projectId: string): void {
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const updated = projects.map((p) => {
    if (p.id === projectId) {
      const currentInsights = p.insights || {
        viewsTotal: p.viewsCount || 0,
        likesTotal: p.likesCount || 0,
        outboundClicks: 0,
        viewsByDay: [],
        referrers: [],
        trendingRank: 1,
        rankChange: 0,
      };
      return {
        ...p,
        insights: {
          ...currentInsights,
          outboundClicks: (currentInsights.outboundClicks || 0) + 1,
        },
      };
    }
    return p;
  });
  setStoredItem(STORAGE_KEYS.PROJECTS, updated);

  if (typeof window !== "undefined") {
    fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, action: "outboundClick" }),
    }).catch(() => {});
  }
}

// Feedbacks
export function getFeedbacksByProject(projectId: string): FeedbackItem[] {
  const feedbacks = getStoredItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
  const upvotedIds = getStoredItem<string[]>(STORAGE_KEYS.UPVOTED_FEEDBACK_IDS, []);
  return feedbacks
    .filter((f) => f.projectId === projectId)
    .map((f) => ({
      ...f,
      isUpvoted: upvotedIds.includes(f.id),
    }));
}

export async function fetchSharedFeedbacks(projectId: string): Promise<FeedbackItem[]> {
  try {
    const res = await fetch(`/api/feedbacks?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const localFeedbacks = getStoredItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
        const map = new Map<string, FeedbackItem>();
        localFeedbacks.forEach((f) => map.set(f.id, f));

        data.forEach((sf: FeedbackItem) => {
          const existing = map.get(sf.id);
          map.set(sf.id, {
            ...existing,
            ...sf,
            upvotes: Math.max(existing?.upvotes || 0, sf.upvotes || 0),
          });
        });

        // Sync local feedbacks missing from server
        localFeedbacks
          .filter((lf) => lf.projectId === projectId && !data.some((d) => d.id === lf.id))
          .forEach((missing) => {
            fetch("/api/feedbacks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(missing),
            }).catch(() => {});
          });

        const merged = Array.from(map.values());
        setStoredItem(STORAGE_KEYS.FEEDBACKS, merged);

        const upvotedIds = getStoredItem<string[]>(STORAGE_KEYS.UPVOTED_FEEDBACK_IDS, []);
        return merged
          .filter((f) => f.projectId === projectId)
          .map((f) => ({
            ...f,
            isUpvoted: upvotedIds.includes(f.id),
          }));
      }
    }
  } catch {}
  return getFeedbacksByProject(projectId);
}

export function addFeedback(feedback: Omit<FeedbackItem, "id" | "createdAt" | "upvotes" | "commentsCount">): FeedbackItem {
  const feedbacks = getStoredItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
  const newItem: FeedbackItem = {
    ...feedback,
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    upvotes: 1,
    commentsCount: 0,
  };

  const updated = [newItem, ...feedbacks];
  setStoredItem(STORAGE_KEYS.FEEDBACKS, updated);

  // Auto upvote by creator
  const upvotedIds = getStoredItem<string[]>(STORAGE_KEYS.UPVOTED_FEEDBACK_IDS, []);
  setStoredItem(STORAGE_KEYS.UPVOTED_FEEDBACK_IDS, [...upvotedIds, newItem.id]);

  // Update project feedback count
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const updatedProjects = projects.map((p) =>
    p.id === feedback.projectId ? { ...p, feedbacksCount: (p.feedbacksCount || 0) + 1 } : p
  );
  setStoredItem(STORAGE_KEYS.PROJECTS, updatedProjects);

  if (typeof window !== "undefined") {
    fetch("/api/feedbacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  }

  return newItem;
}

export function toggleFeedbackUpvote(feedbackId: string): { upvotes: number; isUpvoted: boolean } {
  const feedbacks = getStoredItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
  const upvotedIds = getStoredItem<string[]>(STORAGE_KEYS.UPVOTED_FEEDBACK_IDS, []);

  const isUpvoted = upvotedIds.includes(feedbackId);
  const newUpvotedIds = isUpvoted
    ? upvotedIds.filter((id) => id !== feedbackId)
    : [...upvotedIds, feedbackId];

  setStoredItem(STORAGE_KEYS.UPVOTED_FEEDBACK_IDS, newUpvotedIds);

  let newCount = 0;
  const updatedFeedbacks = feedbacks.map((f) => {
    if (f.id === feedbackId) {
      newCount = Math.max(0, f.upvotes + (isUpvoted ? -1 : 1));
      return { ...f, upvotes: newCount };
    }
    return f;
  });

  setStoredItem(STORAGE_KEYS.FEEDBACKS, updatedFeedbacks);
  return { upvotes: newCount, isUpvoted: !isUpvoted };
}

// Comments
export function getCommentsByProject(projectId: string): CommentItem[] {
  const comments = getStoredItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  return comments.filter((c) => c.projectId === projectId);
}

export async function fetchSharedComments(projectId: string): Promise<CommentItem[]> {
  try {
    const res = await fetch(`/api/comments?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const localComments = getStoredItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
        const map = new Map<string, CommentItem>();
        localComments.forEach((c) => map.set(c.id, c));

        data.forEach((sc: CommentItem) => {
          const existing = map.get(sc.id);
          map.set(sc.id, {
            ...existing,
            ...sc,
            likes: Math.max(existing?.likes || 0, sc.likes || 0),
          });
        });

        localComments
          .filter((lc) => lc.projectId === projectId && !data.some((d) => d.id === lc.id))
          .forEach((missing) => {
            fetch("/api/comments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(missing),
            }).catch(() => {});
          });

        const merged = Array.from(map.values());
        setStoredItem(STORAGE_KEYS.COMMENTS, merged);

        return merged.filter((c) => c.projectId === projectId);
      }
    }
  } catch {}
  return getCommentsByProject(projectId);
}

export function addComment(comment: Omit<CommentItem, "id" | "createdAt" | "likes">): CommentItem {
  const comments = getStoredItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const newItem: CommentItem = {
    ...comment,
    id: `cm-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const updated = [...comments, newItem];
  setStoredItem(STORAGE_KEYS.COMMENTS, updated);

  // Update project comment count
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const updatedProjects = projects.map((p) =>
    p.id === comment.projectId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
  );
  setStoredItem(STORAGE_KEYS.PROJECTS, updatedProjects);

  if (typeof window !== "undefined") {
    fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  }

  return newItem;
}

export function deleteComment(commentId: string): boolean {
  const comments = getStoredItem<CommentItem[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const target = comments.find((c) => c.id === commentId);
  const remaining = comments.filter((c) => c.id !== commentId);
  setStoredItem(STORAGE_KEYS.COMMENTS, remaining);

  if (target) {
    const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const updatedProjects = projects.map((p) =>
      p.id === target.projectId
        ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1) }
        : p
    );
    setStoredItem(STORAGE_KEYS.PROJECTS, updatedProjects);
  }

  if (typeof window !== "undefined") {
    fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, { method: "DELETE" }).catch(() => {});
  }

  return true;
}

// Timeline Updates
export function getTimelineByProject(projectId: string): TimelineUpdate[] {
  const timeline = getStoredItem<TimelineUpdate[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  return timeline.filter((t) => t.projectId === projectId);
}

export function addTimelineUpdate(update: Omit<TimelineUpdate, "id" | "createdAt" | "likes">): TimelineUpdate {
  const timeline = getStoredItem<TimelineUpdate[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  const newItem: TimelineUpdate = {
    ...update,
    id: `tl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const updated = [newItem, ...timeline];
  setStoredItem(STORAGE_KEYS.TIMELINE, updated);
  return newItem;
}

export function deleteTimelineUpdate(timelineId: string): boolean {
  const timeline = getStoredItem<TimelineUpdate[]>(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE);
  const remaining = timeline.filter((t) => t.id !== timelineId);
  setStoredItem(STORAGE_KEYS.TIMELINE, remaining);
  return true;
}

// Community Posts
export function getCommunityPosts(): CommunityPost[] {
  const posts = getStoredItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
  const likedPostIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_COMMUNITY_IDS, []);
  return posts.map((p) => {
    const isLiked = likedPostIds.includes(p.id);
    return {
      ...p,
      isLiked,
      likesCount: Math.max(p.likesCount ?? 0, isLiked ? 1 : 0),
    };
  });
}

export function toggleCommunityLike(postId: string, userId?: string): { likesCount: number; isLiked: boolean } {
  const posts = getStoredItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY_POSTS);
  const likedIds = getStoredItem<string[]>(STORAGE_KEYS.LIKED_COMMUNITY_IDS, []);
  
  const isCurrentlyLiked = likedIds.includes(postId);
  const nextLiked = !isCurrentlyLiked;
  const newLikedIds = isCurrentlyLiked
    ? likedIds.filter((id) => id !== postId)
    : [...likedIds, postId];

  setStoredItem(STORAGE_KEYS.LIKED_COMMUNITY_IDS, newLikedIds);

  let newLikesCount = nextLiked ? 1 : 0;
  let found = false;
  const updatedPosts = posts.map((p) => {
    if (p.id === postId) {
      found = true;
      const delta = isCurrentlyLiked ? -1 : 1;
      newLikesCount = Math.max(0, (p.likesCount || 0) + delta);
      return { ...p, likesCount: newLikesCount, isLiked: nextLiked };
    }
    return p;
  });

  if (found) {
    setStoredItem(STORAGE_KEYS.COMMUNITY, updatedPosts);
  }

  if (typeof window !== "undefined") {
    fetch("/api/community", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.likesCount === "number") {
          const curLiked = getStoredItem<string[]>(STORAGE_KEYS.LIKED_COMMUNITY_IDS, []);
          const isNowLiked = curLiked.includes(postId);
          const finalCount = Math.max(data.likesCount, isNowLiked ? 1 : 0);

          const curPosts = getStoredItem<CommunityPost[]>(STORAGE_KEYS.COMMUNITY, []);
          const synced = curPosts.map((p) =>
            p.id === postId ? { ...p, likesCount: finalCount, isLiked: isNowLiked } : p
          );
          setStoredItem(STORAGE_KEYS.COMMUNITY, synced);
          window.dispatchEvent(new CustomEvent("lumio_data_synced"));
        }
      })
      .catch(() => {});
  }

  return { likesCount: newLikesCount, isLiked: nextLiked };
}

export function addCommunityPost(post: Omit<CommunityPost, "id" | "createdAt" | "likesCount" | "commentsCount">): CommunityPost {
  const posts = getCommunityPosts();
  const newPost: CommunityPost = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
  };

  const updated = [newPost, ...posts];
  setStoredItem(STORAGE_KEYS.COMMUNITY, updated);

  if (typeof window !== "undefined") {
    fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    }).catch((e) => console.warn("Failed to sync community post:", e));
  }

  return newPost;
}

export function deleteCommunityPost(id: string): boolean {
  const posts = getCommunityPosts();
  const filtered = posts.filter((p) => p.id !== id);
  setStoredItem(STORAGE_KEYS.COMMUNITY, filtered);

  if (typeof window !== "undefined") {
    fetch(`/api/community?id=${id}`, { method: "DELETE" }).catch((e) =>
      console.warn("Failed to sync community post deletion:", e)
    );
  }

  return true;
}

export function deleteFeedback(feedbackId: string): boolean {
  const feedbacks = getStoredItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
  const target = feedbacks.find((f) => f.id === feedbackId);
  const remaining = feedbacks.filter((f) => f.id !== feedbackId);
  setStoredItem(STORAGE_KEYS.FEEDBACKS, remaining);

  if (target) {
    const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const updatedProjects = projects.map((p) =>
      p.id === target.projectId
        ? { ...p, feedbacksCount: Math.max(0, (p.feedbacksCount || 0) - 1) }
        : p
    );
    setStoredItem(STORAGE_KEYS.PROJECTS, updatedProjects);
  }

  if (typeof window !== "undefined") {
    fetch(`/api/feedbacks?id=${encodeURIComponent(feedbackId)}`, { method: "DELETE" }).catch(() => {});
  }
  return true;
}

// Builders
export function getBuilders(): Builder[] {
  const builders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, INITIAL_BUILDERS);
  const followedIds = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
  const bannedIds = getStoredItem<string[]>(STORAGE_KEYS.BANNED_USER_IDS, []);
  return builders.map((b) => {
    const isFollowing = followedIds.includes(b.id);
    const isBanned = bannedIds.includes(b.id) || (b.handle && bannedIds.includes(b.handle)) || b.isBanned || false;
    let count = b.followersCount ?? 0;
    if (isFollowing && count === 0) {
      count = 1;
    }
    return {
      ...b,
      followersCount: count,
      isFollowing,
      isBanned,
    };
  });
}

export function isUserBanned(userIdOrHandle: string): boolean {
  if (!userIdOrHandle) return false;
  const banned = getStoredItem<string[]>(STORAGE_KEYS.BANNED_USER_IDS, []);
  return banned.includes(userIdOrHandle);
}

export function banUser(builderId: string): void {
  const banned = getStoredItem<string[]>(STORAGE_KEYS.BANNED_USER_IDS, []);
  if (!banned.includes(builderId)) {
    setStoredItem(STORAGE_KEYS.BANNED_USER_IDS, [...banned, builderId]);
  }
  const builders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, []);
  setStoredItem(
    STORAGE_KEYS.BUILDERS,
    builders.map((b) => (b.id === builderId || b.handle === builderId ? { ...b, isBanned: true } : b))
  );
  if (typeof window !== "undefined") {
    fetch("/api/builders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ builderId, action: "ban" }),
    }).catch(() => {});
    window.dispatchEvent(new CustomEvent("lumio_data_synced"));
  }
}

export function unbanUser(builderId: string): void {
  const banned = getStoredItem<string[]>(STORAGE_KEYS.BANNED_USER_IDS, []);
  setStoredItem(
    STORAGE_KEYS.BANNED_USER_IDS,
    banned.filter((id) => id !== builderId)
  );
  const builders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, []);
  setStoredItem(
    STORAGE_KEYS.BUILDERS,
    builders.map((b) => (b.id === builderId || b.handle === builderId ? { ...b, isBanned: false } : b))
  );
  if (typeof window !== "undefined") {
    fetch("/api/builders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ builderId, action: "unban" }),
    }).catch(() => {});
    window.dispatchEvent(new CustomEvent("lumio_data_synced"));
  }
}

export async function deleteBuilder(builderId: string): Promise<boolean> {
  const builders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, []);
  setStoredItem(
    STORAGE_KEYS.BUILDERS,
    builders.filter((b) => b.id !== builderId && b.handle !== builderId)
  );

  if (typeof window !== "undefined") {
    try {
      await fetch(`/api/builders?id=${encodeURIComponent(builderId)}`, {
        method: "DELETE",
      });
      window.dispatchEvent(new CustomEvent("lumio_data_synced"));
    } catch {}
  }
  return true;
}

export function upsertBuilder(builder: Builder): void {
  const builders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, []);
  const existingIdx = builders.findIndex((b) => b.id === builder.id);
  let updated: Builder[];
  if (existingIdx >= 0) {
    const existing = builders[existingIdx];
    updated = [...builders];
    updated[existingIdx] = {
      ...existing,
      ...builder,
      followersCount: builder.followersCount !== undefined ? builder.followersCount : (existing.followersCount ?? 0),
    };
  } else {
    updated = [{ ...builder, followersCount: builder.followersCount ?? 0 }, ...builders];
  }
  setStoredItem(STORAGE_KEYS.BUILDERS, updated);

  // Update projects author in localStorage
  const projects = getStoredItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
  let projectsUpdated = false;
  const newProjects = projects.map((p) => {
    if (p.author && (p.author.id === builder.id || p.author.handle === builder.handle)) {
      projectsUpdated = true;
      return {
        ...p,
        author: {
          ...p.author,
          name: builder.name,
          handle: builder.handle,
          avatar: builder.avatar,
          role: builder.role,
          bio: builder.bio,
          socials: builder.socials,
        },
      };
    }
    return p;
  });
  if (projectsUpdated) {
    setStoredItem(STORAGE_KEYS.PROJECTS, newProjects);
  }

  if (typeof window !== "undefined") {
    fetch("/api/builders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated[existingIdx >= 0 ? existingIdx : 0]),
    }).catch((e) => console.warn("Failed to sync builder:", e));
  }
}

export function toggleFollowBuilder(
  builderId: string,
  followerId?: string
): { isFollowing: boolean; followersCount: number } {
  const followedIds = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
  const isFollowing = followedIds.includes(builderId);
  const nextFollowing = !isFollowing;
  const updatedFollowed = isFollowing
    ? followedIds.filter((id) => id !== builderId)
    : [...followedIds, builderId];

  setStoredItem(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, updatedFollowed);

  // Update builder in local storage
  const delta = nextFollowing ? 1 : -1;
  const builders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, []);
  let newFollowersCount = nextFollowing ? 1 : 0;
  let builderFound = false;

  const updatedBuilders = builders.map((b) => {
    if (b.id === builderId) {
      builderFound = true;
      newFollowersCount = Math.max(0, (b.followersCount || 0) + delta);
      return { ...b, followersCount: newFollowersCount, isFollowing: nextFollowing };
    }
    return b;
  });

  if (builderFound) {
    setStoredItem(STORAGE_KEYS.BUILDERS, updatedBuilders);
  }

  // Also sync with server asynchronously
  if (typeof window !== "undefined") {
    fetch("/api/builders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ builderId, followerId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.followersCount === "number") {
          const currentBuilders = getStoredItem<Builder[]>(STORAGE_KEYS.BUILDERS, []);
          const synced = currentBuilders.map((b) =>
            b.id === builderId
              ? { ...b, followersCount: data.followersCount, isFollowing: data.isFollowing }
              : b
          );
          setStoredItem(STORAGE_KEYS.BUILDERS, synced);

          const curFollowed = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
          const updatedCurFollowed = data.isFollowing
            ? Array.from(new Set([...curFollowed, builderId]))
            : curFollowed.filter((id) => id !== builderId);
          setStoredItem(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, updatedCurFollowed);

          window.dispatchEvent(new CustomEvent("lumio_data_synced"));
        }
      })
      .catch((e) => console.warn("Failed to sync follow state:", e));
  }

  return { isFollowing: nextFollowing, followersCount: newFollowersCount };
}

export function isBuilderFollowed(builderId?: string): boolean {
  if (!builderId) return false;
  const followedIds = getStoredItem<string[]>(STORAGE_KEYS.FOLLOWED_BUILDER_IDS, []);
  return followedIds.includes(builderId);
}

// Notifications
export function getNotifications(): NotificationItem[] {
  return getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export function markNotificationAsRead(id: string): void {
  const notifs = getNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  setStoredItem(STORAGE_KEYS.NOTIFICATIONS, updated);
}

export function markAllNotificationsAsRead(): void {
  const notifs = getNotifications();
  const updated = notifs.map((n) => ({ ...n, read: true }));
  setStoredItem(STORAGE_KEYS.NOTIFICATIONS, updated);
}

// -------------------------------------------------------------
// Extended Platform Features (50 Features Hub)
// -------------------------------------------------------------
import {
  INITIAL_PERKS,
  INITIAL_TEMPLATES,
  INITIAL_CHALLENGES,
  INITIAL_COLLECTIONS,
  INITIAL_AB_TESTS,
  LOUNGE_ROOMS,
} from "./platformData";
import {
  PerkItem,
  TemplateItem,
  ChallengeItem,
  CuratedCollection,
  AbTestItem,
  LoungeMessage,
} from "./types";

export function getPerks(): PerkItem[] {
  return getStoredItem<PerkItem[]>("zemix_perks", INITIAL_PERKS);
}

export function getTemplates(): TemplateItem[] {
  return getStoredItem<TemplateItem[]>("zemix_templates", INITIAL_TEMPLATES);
}

export function getChallenges(): ChallengeItem[] {
  return getStoredItem<ChallengeItem[]>("zemix_challenges", INITIAL_CHALLENGES);
}

export function toggleJoinChallenge(challengeId: string): ChallengeItem[] {
  const list = getChallenges();
  const updated = list.map((c) => {
    if (c.id === challengeId) {
      const nextJoined = !c.isJoined;
      return {
        ...c,
        isJoined: nextJoined,
        participantsCount: nextJoined ? c.participantsCount + 1 : Math.max(0, c.participantsCount - 1),
      };
    }
    return c;
  });
  setStoredItem("zemix_challenges", updated);
  return updated;
}

export function getCollections(): CuratedCollection[] {
  return getStoredItem<CuratedCollection[]>("zemix_collections", INITIAL_COLLECTIONS);
}

export function getAbTests(): AbTestItem[] {
  return getStoredItem<AbTestItem[]>("zemix_ab_tests", INITIAL_AB_TESTS);
}

export function voteAbTest(testId: string, option: "A" | "B"): AbTestItem[] {
  const list = getAbTests();
  const updated = list.map((t) => {
    if (t.id === testId) {
      if (t.userVoted === option) return t;
      const prevVoted = t.userVoted;
      return {
        ...t,
        userVoted: option,
        votesA: option === "A" ? t.votesA + 1 : prevVoted === "A" ? Math.max(0, t.votesA - 1) : t.votesA,
        votesB: option === "B" ? t.votesB + 1 : prevVoted === "B" ? Math.max(0, t.votesB - 1) : t.votesB,
      };
    }
    return t;
  });
  setStoredItem("zemix_ab_tests", updated);
  return updated;
}

export function getLoungeMessages(roomId: string): LoungeMessage[] {
  const all = getStoredItem<Record<string, LoungeMessage[]>>("zemix_lounge_messages", {
    "room-showcase": [
      {
        id: "m-1",
        roomId: "room-showcase",
        user: { id: "u-1", name: "김민수", handle: "minsu_dev", avatar: "/icon.png", role: "Indie Maker", bio: "" },
        content: "오늘 신규 런칭한 AI 웹앱에 많은 피드백 부탁드립니다! 다들 화이팅입니다 🔥",
        createdAt: "2026-10-25T11:00:00Z",
      },
    ],
    "room-night-code": [
      {
        id: "m-2",
        roomId: "room-night-code",
        user: { id: "u-2", name: "Sarah Lee", handle: "sarah_ui", avatar: "/icon.png", role: "Product Designer", bio: "" },
        content: "새벽 2시까지 디자인 시스템 잡고 있는데 역시 다크모드가 최고네요 ✨",
        createdAt: "2026-10-25T11:30:00Z",
      },
    ],
    "room-tech-qa": [
      {
        id: "m-3",
        roomId: "room-tech-qa",
        user: { id: "u-3", name: "박준영", handle: "jypark", avatar: "/icon.png", role: "Fullstack", bio: "" },
        content: "Next.js 15 Partial Prerendering(PPR) 적용해보신 분 계신가요? 속도 체감 엄청나네요!",
        createdAt: "2026-10-25T12:00:00Z",
      },
    ],
  });
  return all[roomId] || [];
}

export function sendLoungeMessage(roomId: string, user: Builder, content: string): LoungeMessage[] {
  const all = getStoredItem<Record<string, LoungeMessage[]>>("zemix_lounge_messages", {});
  const roomMsgs = all[roomId] || getLoungeMessages(roomId);
  const newMsg: LoungeMessage = {
    id: `msg-${Date.now()}`,
    roomId,
    user,
    content,
    createdAt: new Date().toISOString(),
  };
  const updated = [...roomMsgs, newMsg];
  all[roomId] = updated;
  setStoredItem("zemix_lounge_messages", all);
  return updated;
}

// Builder XP & Level
export function getBuilderXp(userId: string): { xp: number; level: number; tier: string; nextLevelXp: number } {
  const xpMap = getStoredItem<Record<string, number>>("zemix_builder_xp", {});
  const xp = xpMap[userId] || 120; // starter baseline
  const level = Math.floor(xp / 100) + 1;
  const tier = level >= 10 ? "Master Architect" : level >= 5 ? "Power Builder" : "Rookie";
  const nextLevelXp = level * 100;
  return { xp, level, tier, nextLevelXp };
}

export function addBuilderXp(userId: string, amount: number): { xp: number; level: number; tier: string } {
  const xpMap = getStoredItem<Record<string, number>>("zemix_builder_xp", {});
  const current = xpMap[userId] || 120;
  const next = current + amount;
  xpMap[userId] = next;
  setStoredItem("zemix_builder_xp", xpMap);
  return getBuilderXp(userId);
}

// Daily Fortune & Code Quiz
export function getDailyDeveloperFortune(): { quote: string; luckyTech: string; luckyColor: string; memeTip: string } {
  const fortunes = [
    { quote: "오늘 당신의 빌드는 단 한 번의 에러도 없이 초록불(Exit 0)을 띱니다.", luckyTech: "Next.js 15 Turbopack", luckyColor: "Cyan #38bdf8", memeTip: "커밋 메시지에 'fix' 대신 'feat'을 쓰면 기분이 좋아집니다." },
    { quote: "생각지 못한 곳에서 열정적인 첫 진성 유저가 찾아오는 날입니다.", luckyTech: "Supabase Realtime", luckyColor: "Emerald #10b981", memeTip: "커피 한 잔 마시고 CSS 마진을 4px만 더 주면 완벽해집니다." },
    { quote: "골치 아팠던 비동기 버그가 산책 한 번 다녀오면 마법처럼 풀립니다.", luckyTech: "TypeScript Strict Mode", luckyColor: "Purple #a855f7", memeTip: "console.log 지우는 걸 잊지 마세요!" },
  ];
  const dayIndex = new Date().getDate() % fortunes.length;
  return fortunes[dayIndex];
}


