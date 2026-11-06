import fs from "fs";
import path from "path";
import { Builder, Project, CommunityPost, FeedbackItem, CommentItem, TimelineUpdate } from "./types";
import seedStoreData from "@/data/lumio-store.json";

interface StoreData {
  builders: Builder[];
  bannedUsers?: string[]; // banned user IDs or handles
  follows?: Record<string, string[]>; // builderId -> array of follower user IDs
  projectLikes?: Record<string, string[]>; // projectId -> array of user IDs
  communityLikes?: Record<string, string[]>; // postId -> array of user IDs
  projects: Project[];
  communityPosts: CommunityPost[];
  feedbacks: FeedbackItem[];
  comments: CommentItem[];
  timeline: TimelineUpdate[];
}

const IS_VERCEL = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = IS_VERCEL ? path.join("/tmp", "zemix-store") : path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "lumio-store.json");

function getEmptyStore(): StoreData {
  return JSON.parse(JSON.stringify(seedStoreData)) as StoreData;
}

function ensureStoreFile(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      const initial: StoreData = getEmptyStore();
      if (!initial.follows) initial.follows = {};
      if (!initial.projectLikes) initial.projectLikes = {};
      if (!initial.communityLikes) initial.communityLikes = {};
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }

    const content = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(content) as StoreData;
    if (!parsed.builders) parsed.builders = [];
    if (!parsed.bannedUsers) parsed.bannedUsers = [];
    if (!parsed.follows) parsed.follows = {};
    if (!parsed.projectLikes) parsed.projectLikes = {};
    if (!parsed.communityLikes) parsed.communityLikes = {};
    if (!parsed.projects) parsed.projects = [];
    if (!parsed.communityPosts) parsed.communityPosts = [];
    if (!parsed.feedbacks) parsed.feedbacks = [];
    if (!parsed.comments) parsed.comments = [];
    if (!parsed.timeline) parsed.timeline = [];

    return parsed;
  } catch (err) {
    console.error("Error reading store file:", err);
    return getEmptyStore();
  }
}

function writeStoreFile(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing store file:", err);
  }
}

// ----------------- BUILDERS -----------------
export function getSharedFollows(): Record<string, string[]> {
  const store = ensureStoreFile();
  return store.follows || {};
}

export function getSharedBuilders(currentUserId?: string): Builder[] {
  const store = ensureStoreFile();
  if (!store.follows) store.follows = {};
  if (!store.bannedUsers) store.bannedUsers = [];

  return store.builders.map((b) => {
    const hasFollowsRecord = Array.isArray(store.follows![b.id]);
    const followerList = hasFollowsRecord ? store.follows![b.id] : [];
    const count = hasFollowsRecord ? followerList.length : (b.followersCount ?? 0);
    const isFollowing = currentUserId ? followerList.includes(currentUserId) : false;
    const isBanned = store.bannedUsers?.includes(b.id) || store.bannedUsers?.includes(b.handle) || false;

    return {
      ...b,
      followersCount: count,
      isFollowing,
      isBanned,
    };
  });
}

export function deleteSharedBuilder(builderId: string): boolean {
  const store = ensureStoreFile();
  store.builders = store.builders.filter((b) => b.id !== builderId && b.handle !== builderId);
  if (store.follows) {
    delete store.follows[builderId];
  }
  writeStoreFile(store);
  return true;
}

export function toggleSharedBuilderBan(
  builderId: string,
  banned?: boolean
): { isBanned: boolean; bannedUsers: string[] } {
  const store = ensureStoreFile();
  if (!store.bannedUsers) store.bannedUsers = [];
  const idx = store.bannedUsers.indexOf(builderId);
  const shouldBan = banned !== undefined ? banned : idx < 0;
  if (shouldBan && idx < 0) {
    store.bannedUsers.push(builderId);
  } else if (!shouldBan && idx >= 0) {
    store.bannedUsers.splice(idx, 1);
  }
  writeStoreFile(store);
  return { isBanned: shouldBan, bannedUsers: store.bannedUsers };
}

export function getSharedBannedUsers(): string[] {
  const store = ensureStoreFile();
  return store.bannedUsers || [];
}

export function upsertSharedBuilder(builder: Builder): Builder {
  const store = ensureStoreFile();
  if (!store.follows) store.follows = {};

  const existingIndex = store.builders.findIndex((b) => b.id === builder.id);
  const hasFollowsRecord = Array.isArray(store.follows[builder.id]);
  const realFollowersCount = hasFollowsRecord
    ? store.follows[builder.id].length
    : (existingIndex >= 0 ? (store.builders[existingIndex].followersCount ?? 0) : (builder.followersCount ?? 0));

  let savedBuilder: Builder;

  if (existingIndex >= 0) {
    const existing = store.builders[existingIndex];
    savedBuilder = {
      ...existing,
      ...builder,
      id: existing.id,
      followersCount: realFollowersCount,
    };
    store.builders[existingIndex] = savedBuilder;
  } else {
    savedBuilder = {
      ...builder,
      followersCount: realFollowersCount,
    };
    store.builders.push(savedBuilder);
  }

  // Also update projects author info if author matches
  store.projects = store.projects.map((p) => {
    if (p.author && (p.author.id === builder.id || p.author.handle === builder.handle)) {
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

  writeStoreFile(store);
  return savedBuilder;
}

export function toggleSharedBuilderFollow(
  builderId: string,
  followerId: string,
  seedFollowerIds?: string[]
): { isFollowing: boolean; followersCount: number; followerIds: string[] } {
  const store = ensureStoreFile();
  if (!store.follows) store.follows = {};

  if (!store.follows[builderId]) {
    store.follows[builderId] = Array.isArray(seedFollowerIds) ? [...seedFollowerIds] : [];
  } else if (Array.isArray(seedFollowerIds) && seedFollowerIds.length > 0) {
    store.follows[builderId] = Array.from(new Set([...store.follows[builderId], ...seedFollowerIds]));
  }

  // Cannot follow self
  if (!followerId || followerId === builderId) {
    return {
      isFollowing: false,
      followersCount: store.follows[builderId].length,
      followerIds: store.follows[builderId],
    };
  }

  const list = store.follows[builderId];
  const idx = list.indexOf(followerId);
  let isFollowing: boolean;

  if (idx >= 0) {
    list.splice(idx, 1);
    isFollowing = false;
  } else {
    list.push(followerId);
    isFollowing = true;
  }

  const count = list.length;

  // Update builder record in store.builders
  const b = store.builders.find((item) => item.id === builderId);
  if (b) {
    b.followersCount = count;
  }

  writeStoreFile(store);
  return { isFollowing, followersCount: count, followerIds: list };
}

// ----------------- PROJECTS -----------------
export function getSharedProjects(currentUserId?: string): Project[] {
  const store = ensureStoreFile();
  if (!store.projectLikes) store.projectLikes = {};
  return store.projects.map((p) => {
    const list = store.projectLikes![p.id] || [];
    const isLiked = currentUserId ? list.includes(currentUserId) : false;
    const likesCount = Math.max(list.length, p.likesCount || 0);
    return {
      ...p,
      isLiked,
      likesCount,
    };
  });
}

export function getSharedProjectById(id: string, currentUserId?: string): Project | undefined {
  const store = ensureStoreFile();
  if (!store.projectLikes) store.projectLikes = {};
  const found = store.projects.find((p) => p.id === id);
  if (!found) return undefined;
  const list = store.projectLikes[id] || [];
  const isLiked = currentUserId ? list.includes(currentUserId) : false;
  const likesCount = Math.max(list.length, found.likesCount || 0);
  return {
    ...found,
    isLiked,
    likesCount,
  };
}

export function saveSharedProject(projectData: any): Project {
  const store = ensureStoreFile();
  const id = projectData.id || `proj-${Date.now()}`;
  const existingIdx = store.projects.findIndex((p) => p.id === id);

  const newProject: Project = {
    ...projectData,
    id,
    likesCount: projectData.likesCount ?? (existingIdx >= 0 ? store.projects[existingIdx].likesCount : 0),
    viewsCount: projectData.viewsCount ?? (existingIdx >= 0 ? store.projects[existingIdx].viewsCount : 1),
    commentsCount: projectData.commentsCount ?? (existingIdx >= 0 ? store.projects[existingIdx].commentsCount : 0),
    feedbacksCount: projectData.feedbacksCount ?? (existingIdx >= 0 ? store.projects[existingIdx].feedbacksCount : 0),
    followersCount: projectData.followersCount ?? 0,
    insights: projectData.insights || (existingIdx >= 0 ? store.projects[existingIdx].insights : {
      viewsTotal: projectData.viewsCount ?? 1,
      likesTotal: projectData.likesCount ?? 0,
      outboundClicks: 0,
      viewsByDay: [],
      referrers: [],
      trendingRank: 1,
      rankChange: 0,
    }),
    createdAt: projectData.createdAt || (existingIdx >= 0 ? store.projects[existingIdx].createdAt : new Date().toISOString()),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.projects[existingIdx] = newProject;
  } else {
    store.projects = [newProject, ...store.projects];
  }
  writeStoreFile(store);

  // Auto add author to shared builders
  if (projectData.author) {
    upsertSharedBuilder(projectData.author);
  }

  return newProject;
}

export function updateSharedProject(id: string, updates: Partial<Project>): Project | null {
  const store = ensureStoreFile();
  let updated: Project | null = null;
  store.projects = store.projects.map((p) => {
    if (p.id === id) {
      updated = {
        ...p,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }
    return p;
  });

  if (updated) {
    writeStoreFile(store);
  }
  return updated;
}

export function deleteSharedProject(id: string): boolean {
  const store = ensureStoreFile();
  store.projects = store.projects.filter((p) => p.id !== id);
  store.feedbacks = store.feedbacks.filter((f) => f.projectId !== id);
  store.comments = store.comments.filter((c) => c.projectId !== id);
  store.timeline = store.timeline.filter((t) => t.projectId !== id);
  writeStoreFile(store);
  return true;
}

export function recordSharedProjectView(id: string): void {
  const store = ensureStoreFile();
  store.projects = store.projects.map((p) =>
    p.id === id ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p
  );
  writeStoreFile(store);
}

export function recordSharedProjectOutboundClick(id: string): void {
  const store = ensureStoreFile();
  store.projects = store.projects.map((p) => {
    if (p.id === id) {
      const ins = p.insights || {
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
          ...ins,
          outboundClicks: (ins.outboundClicks || 0) + 1,
        },
      };
    }
    return p;
  });
  writeStoreFile(store);
}

export function toggleSharedProjectLike(
  projectId: string,
  userId?: string,
  seedLikedIds?: string[]
): { isLiked: boolean; likesCount: number; likedUserIds: string[] } {
  const store = ensureStoreFile();
  if (!store.projectLikes) store.projectLikes = {};
  if (!store.projectLikes[projectId]) {
    store.projectLikes[projectId] = Array.isArray(seedLikedIds) ? [...seedLikedIds] : [];
  } else if (Array.isArray(seedLikedIds) && seedLikedIds.length > 0) {
    store.projectLikes[projectId] = Array.from(new Set([...store.projectLikes[projectId], ...seedLikedIds]));
  }

  const list = store.projectLikes[projectId];
  let isLiked = false;

  const targetId = userId || "anonymous";
  const idx = list.indexOf(targetId);
  if (idx >= 0) {
    list.splice(idx, 1);
    isLiked = false;
  } else {
    list.push(targetId);
    isLiked = true;
  }

  const count = list.length;
  store.projects = store.projects.map((p) =>
    p.id === projectId ? { ...p, likesCount: count } : p
  );
  writeStoreFile(store);
  return { isLiked, likesCount: count, likedUserIds: list };
}

// ----------------- COMMUNITY POSTS -----------------
export function getSharedCommunityPosts(currentUserId?: string): CommunityPost[] {
  const store = ensureStoreFile();
  if (!store.communityLikes) store.communityLikes = {};
  return store.communityPosts.map((p) => {
    const list = store.communityLikes![p.id] || [];
    const isLiked = currentUserId ? list.includes(currentUserId) : false;
    const likesCount = Math.max(list.length, p.likesCount || 0);
    return {
      ...p,
      isLiked,
      likesCount,
    };
  });
}

export function addSharedCommunityPost(post: any): CommunityPost {
  const store = ensureStoreFile();
  const id = post.id || `post-${Date.now()}`;
  const existingIdx = store.communityPosts.findIndex((p) => p.id === id);

  const newPost: CommunityPost = {
    ...post,
    id,
    createdAt: post.createdAt || (existingIdx >= 0 ? store.communityPosts[existingIdx].createdAt : new Date().toISOString()),
    likesCount: post.likesCount ?? (existingIdx >= 0 ? store.communityPosts[existingIdx].likesCount : 0),
    commentsCount: post.commentsCount ?? (existingIdx >= 0 ? store.communityPosts[existingIdx].commentsCount : 0),
  };

  if (existingIdx >= 0) {
    store.communityPosts[existingIdx] = newPost;
  } else {
    store.communityPosts = [newPost, ...store.communityPosts];
  }
  writeStoreFile(store);

  if (post.author) {
    upsertSharedBuilder(post.author);
  }

  return newPost;
}

export function deleteSharedCommunityPost(id: string): boolean {
  const store = ensureStoreFile();
  store.communityPosts = store.communityPosts.filter((p) => p.id !== id);
  writeStoreFile(store);
  return true;
}

export function toggleSharedCommunityLike(
  postId: string,
  userId?: string,
  seedLikedIds?: string[]
): { isLiked: boolean; likesCount: number; likedUserIds: string[] } {
  const store = ensureStoreFile();
  if (!store.communityLikes) store.communityLikes = {};
  if (!store.communityLikes[postId]) {
    store.communityLikes[postId] = Array.isArray(seedLikedIds) ? [...seedLikedIds] : [];
  } else if (Array.isArray(seedLikedIds) && seedLikedIds.length > 0) {
    store.communityLikes[postId] = Array.from(new Set([...store.communityLikes[postId], ...seedLikedIds]));
  }

  const list = store.communityLikes[postId];
  let isLiked = false;

  const targetId = userId || "anonymous";
  const idx = list.indexOf(targetId);
  if (idx >= 0) {
    list.splice(idx, 1);
    isLiked = false;
  } else {
    list.push(targetId);
    isLiked = true;
  }

  const count = list.length;
  store.communityPosts = store.communityPosts.map((p) =>
    p.id === postId ? { ...p, likesCount: count } : p
  );
  writeStoreFile(store);
  return { isLiked, likesCount: count, likedUserIds: list };
}

// ----------------- FEEDBACKS -----------------
export function getSharedFeedbacks(projectId: string): FeedbackItem[] {
  const store = ensureStoreFile();
  return store.feedbacks.filter((f) => f.projectId === projectId);
}

export function addSharedFeedback(feedback: any): FeedbackItem {
  const store = ensureStoreFile();
  const id = feedback.id || `fb-${Date.now()}`;
  const existingIdx = store.feedbacks.findIndex((f) => f.id === id);

  const newItem: FeedbackItem = {
    ...feedback,
    id,
    createdAt: feedback.createdAt || (existingIdx >= 0 ? store.feedbacks[existingIdx].createdAt : new Date().toISOString()),
    upvotes: feedback.upvotes ?? (existingIdx >= 0 ? store.feedbacks[existingIdx].upvotes : 1),
    commentsCount: feedback.commentsCount ?? (existingIdx >= 0 ? store.feedbacks[existingIdx].commentsCount : 0),
  };

  if (existingIdx >= 0) {
    store.feedbacks[existingIdx] = newItem;
  } else {
    store.feedbacks = [newItem, ...store.feedbacks];
  }

  // Update project feedbacksCount
  const count = store.feedbacks.filter((f) => f.projectId === feedback.projectId).length;
  store.projects = store.projects.map((p) =>
    p.id === feedback.projectId ? { ...p, feedbacksCount: count } : p
  );

  writeStoreFile(store);
  return newItem;
}

export function deleteSharedFeedback(id: string): boolean {
  const store = ensureStoreFile();
  const target = store.feedbacks.find((f) => f.id === id);
  store.feedbacks = store.feedbacks.filter((f) => f.id !== id);
  if (target) {
    const count = store.feedbacks.filter((f) => f.projectId === target.projectId).length;
    store.projects = store.projects.map((p) =>
      p.id === target.projectId ? { ...p, feedbacksCount: count } : p
    );
  }
  writeStoreFile(store);
  return true;
}

// ----------------- COMMENTS -----------------
export function getSharedComments(projectId: string): CommentItem[] {
  const store = ensureStoreFile();
  return store.comments.filter((c) => c.projectId === projectId);
}

export function addSharedComment(comment: any): CommentItem {
  const store = ensureStoreFile();
  const id = comment.id || `cm-${Date.now()}`;
  const existingIdx = store.comments.findIndex((c) => c.id === id);

  const newItem: CommentItem = {
    ...comment,
    id,
    createdAt: comment.createdAt || (existingIdx >= 0 ? store.comments[existingIdx].createdAt : new Date().toISOString()),
    likes: comment.likes ?? (existingIdx >= 0 ? store.comments[existingIdx].likes : 0),
  };

  if (existingIdx >= 0) {
    store.comments[existingIdx] = newItem;
  } else {
    store.comments = [...store.comments, newItem];
  }

  // Update project / communityPost commentsCount
  const count = store.comments.filter((c) => c.projectId === comment.projectId).length;
  store.projects = store.projects.map((p) =>
    p.id === comment.projectId ? { ...p, commentsCount: count } : p
  );
  store.communityPosts = store.communityPosts.map((cp) =>
    cp.id === comment.projectId ? { ...cp, commentsCount: count } : cp
  );

  writeStoreFile(store);
  return newItem;
}

export function deleteSharedComment(id: string): boolean {
  const store = ensureStoreFile();
  const target = store.comments.find((c) => c.id === id);
  store.comments = store.comments.filter((c) => c.id !== id);
  if (target) {
    const count = store.comments.filter((c) => c.projectId === target.projectId).length;
    store.projects = store.projects.map((p) =>
      p.id === target.projectId ? { ...p, commentsCount: count } : p
    );
    store.communityPosts = store.communityPosts.map((cp) =>
      cp.id === target.projectId ? { ...cp, commentsCount: count } : cp
    );
  }
  writeStoreFile(store);
  return true;
}

// ----------------- TIMELINE -----------------
export function getSharedTimeline(projectId: string): TimelineUpdate[] {
  const store = ensureStoreFile();
  return store.timeline.filter((t) => t.projectId === projectId);
}

export function addSharedTimeline(update: Omit<TimelineUpdate, "id" | "createdAt" | "likes">): TimelineUpdate {
  const store = ensureStoreFile();
  const newItem: TimelineUpdate = {
    ...update,
    id: `tl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  store.timeline = [newItem, ...store.timeline];
  writeStoreFile(store);
  return newItem;
}

export function deleteSharedTimeline(id: string): boolean {
  const store = ensureStoreFile();
  store.timeline = store.timeline.filter((t) => t.id !== id);
  writeStoreFile(store);
  return true;
}
