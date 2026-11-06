import { Project, Builder, CommunityPost, NotificationItem, FeedbackItem, CommentItem, TimelineUpdate } from "./types";

// Only real users who authenticate via Supabase will appear here
export const INITIAL_BUILDERS: Builder[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_FEEDBACKS: FeedbackItem[] = [];
export const INITIAL_COMMENTS: CommentItem[] = [];
export const INITIAL_TIMELINE: TimelineUpdate[] = [];
export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
