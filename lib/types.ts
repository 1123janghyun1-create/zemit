export type ProjectStatus = "Public" | "Beta" | "MVP" | "In Development" | "Concept";

export interface Builder {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  role: string;
  email?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
  isStartingMember?: boolean;
  isFoundingMember?: boolean;
  projectsCount?: number;
  totalLikes?: number;
  followersCount?: number;
  isFollowing?: boolean;
  xp?: number;
  level?: number;
  tier?: "Rookie" | "Power Builder" | "Master Architect";
  isOpenToWork?: boolean;
  verifiedShippedCount?: number;
  streakDays?: number;
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
  isAnonymous?: boolean;
  deviceInfo?: string;
  isTopReviewer?: boolean;
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
  changelog?: { version: string; date: string; content: string }[];
  earlyBirdCoupon?: { code: string; discount: string; description: string };
  donationUrl?: string;
  polls?: { question: string; options: { text: string; votes: number }[]; userVotedIndex?: number };
  openMetrics?: { mrr?: string; mau?: string; totalUsers?: string };
  hiringRoles?: string[];
  isUpcoming?: boolean;
  launchDate?: string;
  subscribersCount?: number;
  dailyRank?: number;
  isDailyWinner?: boolean;
  isProductHuntWarmup?: boolean;
  isForSale?: boolean;
  askingPrice?: string;
  lifetimeDeal?: { originalPrice: string; dealPrice: string; slotsLeft: number; url?: string };
  microPledge?: { targetAmount: number; currentAmount: number; backersCount: number; deadline: string };
  isSpotlight?: boolean;
  uptimeStatus?: { status: "operational" | "degraded" | "down"; responseTimeMs: number; uptimePercentage: number };
  lighthouseScores?: { performance: number; accessibility: number; bestPractices: number; seo: number };
  isPrivateBeta?: boolean;
  privateBetaCode?: string;
  goodFirstIssuesCount?: number;
  seekingCoFounder?: boolean;
  investorInterestCount?: number;
  makerStory?: string;
  quests?: { id: string; title: string; reward: string; isCompleted?: boolean }[];
  timeMachineVersions?: { version: string; date: string; imageUrl: string; description: string }[];
}

export interface PerkItem {
  id: string;
  name: string;
  provider: string;
  logo: string;
  tagline: string;
  discount: string;
  code: string;
  category: "Hosting & Cloud" | "Database & Backend" | "AI & APIs" | "Productivity" | "Design";
  claimUrl: string;
  isFeatured?: boolean;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: "Boilerplate" | "UI Kit" | "Figma" | "Notion" | "API Starter";
  price: string;
  author: Builder;
  description: string;
  previewUrl: string;
  downloadUrl: string;
  starsCount: number;
  tags: string[];
}

export interface ChallengeItem {
  id: string;
  hashtag: string;
  title: string;
  description: string;
  deadline: string;
  rewardBadge: string;
  participantsCount: number;
  submissionsCount: number;
  isJoined?: boolean;
}

export interface CuratedCollection {
  id: string;
  title: string;
  tagline: string;
  curator: Builder;
  projectIds: string[];
  likesCount: number;
  bannerGradient: [string, string];
}

export interface AbTestItem {
  id: string;
  title: string;
  author: Builder;
  imageA: string;
  titleA: string;
  votesA: number;
  imageB: string;
  titleB: string;
  votesB: number;
  userVoted?: "A" | "B";
  createdAt: string;
}

export interface LoungeMessage {
  id: string;
  roomId: string;
  user: Builder;
  content: string;
  createdAt: string;
}

export interface UpcomingProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  logo: string;
  coverImage?: string;
  targetLaunchDate: string; // ISO date string e.g. "2026-11-05"
  daysLeft: number;
  author: Builder;
  tags: string[];
  subscribersCount: number;
  isSubscribed?: boolean;
  previewUrl?: string;
}

export interface ShelvedIdea {
  id: string;
  title: string;
  summary: string;
  reasonShelved: string;
  recommendedStack: string[];
  githubUrl?: string;
  author: Builder;
  createdAt: string;
  forksCount: number;
  isForked?: boolean;
}

export interface CommunityPost {
  id: string;
  category: "General" | "Show & Tell" | "Feedback Request" | "Team Building" | "Tips & Insights" | "Desk Setup & Gear";
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

