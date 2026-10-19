export type ProjectStatus = "Public" | "Beta" | "MVP" | "In Development" | "Concept";

export interface Builder {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  role: string;
  isStartingMember?: boolean;
  isFoundingMember?: boolean;
  projectsCount?: number;
  totalLikes?: number;
  followersCount?: number;
  isFollowing?: boolean;
  socials?: {
    github?: string;
    twitter?: string;
    website?: string;
    linkedin?: string;
  };
}

export interface FeedbackItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: "idea" | "bug" | "suggestion" | "praise";
  title: string;
  description: string;
  upvotes: number;
  isUpvoted?: boolean;
  status: "Open" | "In Review" | "Planned" | "Completed" | "Declined";
  createdAt: string;
  commentsCount: number;
}

export interface CommentItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface TimelineUpdate {
  id: string;
  projectId: string;
  version: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  images?: string[];
}

export interface ProjectInsight {
  viewsTotal: number;
  likesTotal: number;
  outboundClicks: number;
  viewsByDay: { date: string; views: number }[];
  referrers: { source: string; count: number; percentage: number }[];
  trendingRank: number;
  rankChange: number;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  handle: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  logo: string;
  coverImage: string;
  screenshots: string[];
  websiteUrl: string;
  githubUrl?: string;
  author: Builder;
  tags: string[];
  likesCount: number;
  isLiked?: boolean;
  viewsCount: number;
  commentsCount: number;
  feedbacksCount: number;
  followersCount: number;
  lookingForTeam: boolean;
  lookingForTeamRoles?: string[];
  lookingForTesters: boolean;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  coverGradient?: [string, string];
  demoUrl?: string;
  stage?: "idea" | "building" | "beta" | "public";
  lookingFor?: string[];
  teamChat?: { platform: string; url: string };
  collaborators?: Collaborator[];
  insights?: ProjectInsight;
}

export interface CommunityPost {
  id: string;
  category: "General" | "Show & Tell" | "Feedback Request" | "Team Building" | "Tips & Insights";
  title: string;
  content: string;
  imageUrl?: string;
  author: Builder;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
  tags?: string[];
}

export interface NotificationItem {
  id: string;
  type: "like" | "comment" | "feedback" | "collaborate" | "update";
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  senderAvatar?: string;
}

