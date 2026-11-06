import { createClient } from "@supabase/supabase-js";
import { Project, CommunityPost, FeedbackItem, CommentItem } from "@/lib/types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://pyyfsnovqxixhsxtirwt.supabase.co";

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_0BveDUowGV-uo9_i7V_w_w_OeknYWKE";

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

// Map Project to Supabase row format
export function projectToRow(p: Project) {
  const stage = p.stage || (p.status === "MVP" ? "idea" : p.status === "Beta" ? "beta" : "public");
  return {
    id: p.id,
    user_id: p.author?.id || "anonymous",
    title: p.title,
    tagline: p.tagline || "",
    description: p.description || "",
    status: p.status || "Public",
    logo_url: p.logo || "",
    cover_url: p.coverImage || "",
    screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
    website_url: p.websiteUrl || "",
    github_url: p.githubUrl || null,
    author: p.author || {},
    tags: Array.isArray(p.tags) ? p.tags : [],
    likes_count: p.likesCount || 0,
    views_count: p.viewsCount || 1,
    comments_count: p.commentsCount || 0,
    feedbacks_count: p.feedbacksCount || 0,
    looking_for_team: !!p.lookingForTeam,
    looking_for_testers: !!p.lookingForTesters,
    insights: {
      ...(p.insights || {}),
      stage,
      demoUrl: p.demoUrl || undefined,
      teamChat: p.teamChat || undefined,
      lookingFor: Array.isArray(p.lookingFor) ? p.lookingFor : [],
      lookingForTeamRoles: Array.isArray(p.lookingForTeamRoles) ? p.lookingForTeamRoles : [],
      coverGradient: p.coverGradient || undefined,
      viewsTotal: (p.insights && p.insights.viewsTotal) || p.viewsCount || 1,
      likesTotal: (p.insights && p.insights.likesTotal) || p.likesCount || 0,
      outboundClicks: (p.insights && p.insights.outboundClicks) || 0,
      viewsByDay: (p.insights && p.insights.viewsByDay) || [],
      referrers: (p.insights && p.insights.referrers) || [],
      trendingRank: (p.insights && p.insights.trendingRank) || 1,
      rankChange: (p.insights && p.insights.rankChange) || 0,
    },
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString(),
  };
}

// Map Supabase row format to Project
export function rowToProject(row: any): Project {
  const insights = (row.insights && typeof row.insights === "object") ? row.insights : {};
  const stage = row.stage || insights.stage || (row.status === "MVP" ? "idea" : row.status === "Beta" ? "beta" : "public");
  const demoUrl = row.demo_url || insights.demoUrl || undefined;
  const teamChat = insights.teamChat || undefined;
  const lookingFor = Array.isArray(insights.lookingFor)
    ? insights.lookingFor
    : [
        ...(row.looking_for_team ? ["developer", "designer"] : []),
        ...(row.looking_for_testers ? ["tester"] : []),
      ];
  const lookingForTeamRoles = Array.isArray(insights.lookingForTeamRoles)
    ? insights.lookingForTeamRoles
    : (row.looking_for_team ? ["developer", "designer"] : []);
  const coverGradient = insights.coverGradient || undefined;

  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline || "",
    description: row.description || "",
    status: row.status || "Public",
    stage,
    logo: row.logo_url || "",
    coverImage: row.cover_url || "",
    coverGradient,
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    websiteUrl: row.website_url || "",
    demoUrl,
    githubUrl: row.github_url || undefined,
    teamChat,
    author: row.author && row.author.id ? row.author : {
      id: row.user_id || "anonymous",
      name: (row.author && row.author.name) || "Maker",
      handle: (row.author && row.author.handle) || "maker",
      avatar: (row.author && row.author.avatar) || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (row.user_id || "maker"),
      bio: (row.author && row.author.bio) || "zemix 메이커",
      role: (row.author && row.author.role) || "Maker",
    },
    tags: Array.isArray(row.tags) ? row.tags : [],
    likesCount: row.likes_count || 0,
    viewsCount: row.views_count || 1,
    commentsCount: row.comments_count || 0,
    feedbacksCount: row.feedbacks_count || 0,
    followersCount: 0,
    lookingFor,
    lookingForTeam: !!row.looking_for_team,
    lookingForTeamRoles,
    lookingForTesters: !!row.looking_for_testers,
    insights: {
      viewsTotal: row.views_count || 1,
      likesTotal: row.likes_count || 0,
      outboundClicks: 0,
      viewsByDay: [],
      referrers: [],
      trendingRank: 1,
      rankChange: 0,
      ...insights,
    },
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// Map CommunityPost to row
export function postToRow(post: CommunityPost) {
  return {
    id: post.id,
    category: post.category || "General",
    title: post.title,
    content: post.content,
    image_url: post.imageUrl || null,
    author: post.author || {},
    author_id: post.author?.id || null,
    likes_count: post.likesCount || 0,
    comments_count: post.commentsCount || 0,
    tags: post.tags || [],
    created_at: post.createdAt || new Date().toISOString(),
  };
}

// Map row to CommunityPost
export function rowToPost(row: any): CommunityPost {
  return {
    id: row.id,
    category: row.category || "General",
    title: row.title,
    content: row.content,
    imageUrl: row.image_url || undefined,
    author: row.author && row.author.id ? row.author : {
      id: row.author_id || "anonymous",
      name: "Maker",
      handle: "maker",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (row.author_id || "maker"),
      bio: "zemix 메이커",
      role: "Maker",
    },
    likesCount: row.likes_count || 0,
    commentsCount: row.comments_count || 0,
    tags: row.tags || [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}
