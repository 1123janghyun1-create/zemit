"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Heart,
  Eye,
  Globe,
  Share2,
  Plus,
  MessageSquare,
  Sparkles,
  TrendingUp,
  BarChart2,
  Users,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Send,
  ExternalLink,
  ChevronRight,
  Edit3,
  Trash2,
  Play,
  MessageCircle,
  Smartphone,
  Award,
  Image as ImageIcon,
  Bot,
  Zap,
  Languages,
  Coffee,
  Gift,
  History,
  BarChart3,
  Check,
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import BadgeModal from "@/components/project-tools/BadgeModal";
import SandboxModal from "@/components/project-tools/SandboxModal";
import CardNewsModal from "@/components/project-tools/CardNewsModal";
import AiLaunchWriterModal from "@/components/project-tools/AiLaunchWriterModal";
import SeoAuditModal from "@/components/project-tools/SeoAuditModal";
import CoffeeChatModal from "@/components/project-tools/CoffeeChatModal";
import GrowthAndViralModal from "@/components/project-tools/GrowthAndViralModal";
import AiDevSuiteModal from "@/components/project-tools/AiDevSuiteModal";
import MakerStoryTab from "@/components/project-tools/MakerStoryTab";
import ProjectCard from "@/components/ProjectCard";
import {
  getProjects,
  getProjectById,
  isProjectLiked,
  toggleProjectLike,
  recordProjectView,
  recordProjectOutboundClick,
  getFeedbacksByProject,
  fetchSharedFeedbacks,
  addFeedback,
  toggleFeedbackUpvote,
  getCommentsByProject,
  fetchSharedComments,
  addComment,
  getTimelineByProject,
  addTimelineUpdate,
  toggleFollowBuilder,
  isBuilderFollowed,
  deleteProject,
  deleteFeedback,
  deleteComment,
  deleteTimelineUpdate,
  fetchSharedProjects,
} from "@/lib/storage";
import { Project, FeedbackItem, CommentItem, TimelineUpdate } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

type TabType = "overview" | "feedback" | "timeline" | "comments" | "insights";

const STAGE_LABELS: Record<string, { label: string; badgeClass: string; desc: string }> = {
  idea: {
    label: "💡 아이디어 (Idea)",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    desc: "아직 구현 전인 아이디어 및 컨셉 구상 단계",
  },
  building: {
    label: "🛠️ 개발 중 (Building)",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    desc: "현재 활발히 기능 개발 및 제작이 진행 중인 프로젝트",
  },
  beta: {
    label: "🧪 베타 테스트 (Beta)",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    desc: "실제 동작하며 초기 사용자의 피드백을 수집 중인 상태",
  },
  public: {
    label: "🚀 공식 런칭 (Public)",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    desc: "누구나 사용할 수 있도록 안정적으로 배포된 공식 서비스",
  },
};

const HELP_LABELS: Record<string, { label: string; desc: string }> = {
  tester: {
    label: "🧪 테스터 모집",
    desc: "서비스를 직접 사용해보고 버그나 사용성을 피드백해줄 테스터",
  },
  feedback: {
    label: "💬 피드백 환영",
    desc: "기획 방향성, UX, 아이디어에 대한 의견을 나눠줄 동료",
  },
  developer: {
    label: "💻 개발자 모집",
    desc: "프론트/백엔드 기능 구현을 함께 완성할 개발 팀원",
  },
  designer: {
    label: "🎨 디자이너 모집",
    desc: "UI/UX 디자인, 브랜딩, 그래픽 에셋 작업을 함께할 디자이너",
  },
  cofounder: {
    label: "🤝 공동창업자 모집",
    desc: "비즈니스와 장기적인 비전을 함께 키워갈 파트너",
  },
};

export default function ProjectDetailClient({
  projectId,
  initialProject,
}: {
  projectId: string;
  initialProject?: Project;
}) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(() => {
    if (initialProject) {
      if (typeof window !== "undefined") {
        const isLiked = isProjectLiked(initialProject.id);
        const local = getProjectById(initialProject.id);
        const localTime = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0;
        const initTime = initialProject?.updatedAt ? new Date(initialProject.updatedAt).getTime() : 0;
        const base = (local && localTime > initTime)
          ? { ...initialProject, ...local }
          : { ...local, ...initialProject };
        return {
          ...base,
          isLiked: isLiked || !!local?.isLiked || !!initialProject.isLiked,
          likesCount: Math.max(local?.likesCount || 0, initialProject.likesCount || 0),
          viewsCount: Math.max(local?.viewsCount || 0, initialProject.viewsCount || 0),
        };
      }
      return initialProject;
    }
    if (typeof window !== "undefined") {
      return getProjectById(projectId) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(!initialProject);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineUpdate[]>([]);
  const [copied, setCopied] = useState(false);
  const [isFollowingMaker, setIsFollowingMaker] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "project" | "feedback" | "comment" | "timeline";
    id: string;
    description?: string;
  } | null>(null);

  // New feedback form states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"idea" | "bug" | "suggestion" | "praise">("idea");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackDesc, setFeedbackDesc] = useState("");

  // New comment state
  const [newComment, setNewComment] = useState("");

  // New update modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateVersion, setUpdateVersion] = useState("v1.1.0");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");

  // Selected screenshot for preview modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Power Tool Modals
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [showCardNewsModal, setShowCardNewsModal] = useState(false);
  const [showAiLaunchModal, setShowAiLaunchModal] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [showCoffeeChatModal, setShowCoffeeChatModal] = useState(false);
  const [showViralModal, setShowViralModal] = useState(false);
  const [showAiDevModal, setShowAiDevModal] = useState(false);
  const [investorInterests, setInvestorInterests] = useState(4);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});
  const [upvotedComments, setUpvotedComments] = useState<Record<string, number>>({});
  const [isEnglish, setIsEnglish] = useState(false);
  const [isAnonymousFeedback, setIsAnonymousFeedback] = useState(false);
  const [bugDeviceInfo, setBugDeviceInfo] = useState("Chrome (Desktop)");
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  const viewRecordedRef = React.useRef(false);

  useEffect(() => {
    let mounted = true;

    // Record view exactly once per component lifecycle
    if (!viewRecordedRef.current) {
      viewRecordedRef.current = true;
      recordProjectView(projectId);
      setProject((prev) => (prev ? { ...prev, viewsCount: (prev.viewsCount || 0) + 1 } : null));
    }

    if (!initialProject) {
      const proj = getProjectById(projectId);
      if (proj) {
        setProject(proj);
        setLoading(false);
        setFeedbacks(getFeedbacksByProject(projectId));
        setComments(getCommentsByProject(projectId));
        setTimeline(getTimelineByProject(projectId));
        setIsFollowingMaker(isBuilderFollowed(proj.author?.id));
      }
    } else {
      setFeedbacks(getFeedbacksByProject(projectId));
      setComments(getCommentsByProject(projectId));
      setTimeline(getTimelineByProject(projectId));
      setIsFollowingMaker(isBuilderFollowed(initialProject.author?.id));
    }

    // Always fetch latest shared project, feedbacks, comments from server so any device can load it
    fetchSharedProjects(user?.id)
      .then((allProjects) => {
        if (!mounted) return;
        setRelatedProjects(allProjects.filter((p) => p.id !== projectId).slice(0, 3));
        const found = allProjects.find((p) => p.id === projectId);
        if (found) {
          setProject((prev) => {
            const isLiked = isProjectLiked(projectId) || prev?.isLiked || found.isLiked || false;
            const likesCount = Math.max(
              found.likesCount || 0,
              prev?.likesCount || 0,
              isLiked ? 1 : 0
            );
            const viewsCount = Math.max(
              found.viewsCount || 0,
              prev?.viewsCount || 0
            );
            const prevTime = prev?.updatedAt ? new Date(prev.updatedAt).getTime() : 0;
            const foundTime = found?.updatedAt ? new Date(found.updatedAt).getTime() : 0;
            const chosen = (prev && prevTime > foundTime) ? { ...found, ...prev } : { ...prev, ...found };
            return {
              ...chosen,
              isLiked,
              likesCount,
              viewsCount,
            };
          });
          setIsFollowingMaker(isBuilderFollowed(found.author?.id));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    fetchSharedFeedbacks(projectId).then((f) => mounted && setFeedbacks(f));
    fetchSharedComments(projectId).then((c) => mounted && setComments(c));

    const handleSync = () => {
      fetchSharedProjects(user?.id).then((allProjects) => {
        if (!mounted) return;
        const found = allProjects.find((p) => p.id === projectId);
        if (found) {
          setProject((prev) => {
            const isLiked = isProjectLiked(projectId) || prev?.isLiked || found.isLiked || false;
            const likesCount = Math.max(
              found.likesCount || 0,
              prev?.likesCount || 0,
              isLiked ? 1 : 0
            );
            const viewsCount = Math.max(
              found.viewsCount || 0,
              prev?.viewsCount || 0
            );
            const prevTime = prev?.updatedAt ? new Date(prev.updatedAt).getTime() : 0;
            const foundTime = found?.updatedAt ? new Date(found.updatedAt).getTime() : 0;
            const chosen = (prev && prevTime > foundTime) ? { ...found, ...prev } : { ...prev, ...found };
            return {
              ...chosen,
              isLiked,
              likesCount,
              viewsCount,
            };
          });
          setIsFollowingMaker(isBuilderFollowed(found.author?.id));
        }
      });
      setFeedbacks(getFeedbacksByProject(projectId));
      setComments(getCommentsByProject(projectId));
      setTimeline(getTimelineByProject(projectId));
    };
    window.addEventListener("lumio_data_synced", handleSync);
    return () => {
      mounted = false;
      window.removeEventListener("lumio_data_synced", handleSync);
    };
  }, [projectId, user?.id, initialProject]);

  if (loading && !project) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-8 w-48 bg-surface-muted rounded mb-6" />
        <div className="h-64 bg-surface-muted rounded-card mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-32 bg-surface-muted rounded-card" />
            <div className="h-48 bg-surface-muted rounded-card" />
          </div>
          <div className="h-64 bg-surface-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-bold text-foreground">프로젝트를 찾을 수 없습니다</h2>
        <p className="mt-2 text-sm text-muted">삭제되었거나 잘못된 링크입니다.</p>
        <Link
          href="/"
          className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    if (!user) {
      if (confirm("좋아요를 누르려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    const result = toggleProjectLike(project.id, user.id);
    setProject((prev) => (prev ? { ...prev, likesCount: result.likesCount, isLiked: result.isLiked } : null));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key.toLowerCase() === "l" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleLike();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFollow = () => {
    if (!user) {
      if (confirm("메이커를 팔로우하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    if (!project?.author?.id || user.id === project.author.id) return;
    const res = toggleFollowBuilder(project.author.id, user.id);
    setIsFollowingMaker(res.isFollowing);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            author: {
              ...prev.author,
              isFollowing: res.isFollowing,
              followersCount: res.followersCount,
            },
          }
        : null
    );
  };

  const isOwner = Boolean(
    user && project && (user.id === project.author?.id || user.handle === project.author?.handle || isAdmin)
  );

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "project") {
      deleteProject(deleteTarget.id);
      router.push("/");
    } else if (deleteTarget.type === "feedback") {
      deleteFeedback(deleteTarget.id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    } else if (deleteTarget.type === "comment") {
      deleteComment(deleteTarget.id);
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } else if (deleteTarget.type === "timeline") {
      deleteTimelineUpdate(deleteTarget.id);
      setTimeline((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    }

    setDeleteTarget(null);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (confirm("피드백을 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    if (user.isBanned) {
      alert("관리자에 의해 계정이 밴(정지)되었습니다. 피드백을 작성할 수 없습니다.");
      return;
    }
    if (!feedbackTitle.trim() || !feedbackDesc.trim()) return;

    const finalDesc = feedbackType === "bug" && bugDeviceInfo
      ? `[기기/환경: ${bugDeviceInfo}]\n${feedbackDesc}`
      : feedbackDesc;

    const created = addFeedback({
      projectId: project.id,
      userId: isAnonymousFeedback ? "anon" : user.id,
      userName: isAnonymousFeedback ? "익명의 빌더 🕵️" : user.name,
      userAvatar: isAnonymousFeedback
        ? "https://api.dicebear.com/7.x/identicon/svg?seed=" + Date.now()
        : user.avatar,
      type: feedbackType,
      title: feedbackTitle,
      description: finalDesc,
      status: "Open",
    });

    setFeedbacks([created, ...feedbacks]);
    setFeedbackTitle("");
    setFeedbackDesc("");
    setIsAnonymousFeedback(false);
    setShowFeedbackModal(false);
  };

  const handleUpvoteFeedback = (feedbackId: string) => {
    if (!user) {
      if (confirm("피드백을 추천하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    const res = toggleFeedbackUpvote(feedbackId);
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, upvotes: res.upvotes, isUpvoted: res.isUpvoted } : f))
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (confirm("댓글을 남기려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }
    if (user.isBanned) {
      alert("관리자에 의해 계정이 밴(정지)되었습니다. 댓글을 작성할 수 없습니다.");
      return;
    }
    if (!newComment.trim()) return;

    const created = addComment({
      projectId: project.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment,
    });

    setComments([...comments, created]);
    setNewComment("");
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isOwner) return;
    if (!updateTitle.trim() || !updateContent.trim()) return;

    const created = addTimelineUpdate({
      projectId: project.id,
      version: updateVersion,
      title: updateTitle,
      content: updateContent,
    });

    setTimeline([created, ...timeline]);
    setUpdateTitle("");
    setUpdateContent("");
    setShowUpdateModal(false);
  };

  const tabs = [
    { key: "overview", label: "소개 (Overview)" },
    { key: "feedback", label: `피드백 (${feedbacks.length})` },
    { key: "timeline", label: `타임라인 & 업데이트 (${timeline.length})` },
    { key: "comments", label: `댓글 (${comments.length})` },
    { key: "insights", label: "인사이트 (Analytics)" },
  ];

  const stageKey = project?.stage || (project?.status === "MVP" ? "idea" : project?.status === "Beta" ? "beta" : "public");
  const stageInfo = (stageKey && STAGE_LABELS[stageKey]) || STAGE_LABELS["public"];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 animate-fade-in">
      {/* Hero Cover Banner */}
      {project.coverImage ? (
        <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm w-full bg-surface-muted group flex items-center justify-center min-h-[200px] max-h-[380px] sm:max-h-[440px]">
          {/* Ambient blurred backdrop for custom-ratio banners */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-25 scale-110"
            style={{ backgroundImage: `url(${project.coverImage})` }}
          />
          <img
            src={project.coverImage}
            alt={project.title}
            className="relative z-10 w-full max-h-[380px] sm:max-h-[440px] object-contain transition-transform duration-500 group-hover:scale-[1.005]"
          />
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-2xl border border-border shadow-sm h-44 sm:h-56 w-full"
          style={{
            background: project.coverGradient
              ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
              : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Project Identity & Action Card */}
      <div className="mt-5 sm:mt-6 mb-8">
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Logo + Info */}
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              {project.logo ? (
                <img
                  src={project.logo}
                  alt={project.title}
                  className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl border-2 border-surface bg-surface object-cover shadow-md transition-transform hover:scale-105"
                />
              ) : (
                <span
                  className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl text-2xl sm:text-3xl font-extrabold text-white shadow-md border-2 border-surface"
                  style={{
                    background: project.coverGradient
                      ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
                      : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                >
                  {(project.title || "P").slice(0, 1).toUpperCase()}
                </span>
              )}

              <div className="min-w-0 flex-1">
                {/* Badges */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageInfo.badgeClass}`}>
                    {stageInfo.label}
                  </span>
                  {project.lookingForTeam && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-primary-soft text-primary border border-primary/20">
                      👥 팀원 모집
                    </span>
                  )}
                  {project.lookingForTesters && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      🧪 테스터 모집
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {project.title}
                </h1>

                {/* Tagline */}
                <p className="mt-1 text-sm sm:text-base text-muted line-clamp-2 leading-relaxed">
                  {isEnglish ? `[EN Translated] ${project.tagline}` : project.tagline}
                </p>

                {/* Maker Chip */}
                {project.author && (
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/builders/${project.author.id || project.author.handle || ""}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted/60 hover:bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground transition-all group"
                    >
                      <img
                        src={project.author.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=maker"}
                        alt={project.author.name || "Maker"}
                        className="h-4 w-4 rounded-full object-cover"
                      />
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.author.name || "Maker"}
                      </span>
                      <span className="text-[11px] text-muted">
                        @{project.author.handle || "maker"}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        isFollowingMaker
                          ? "border-border bg-surface-muted text-muted"
                          : "border-primary/30 text-primary hover:bg-primary hover:text-white"
                      }`}
                    >
                      {isFollowingMaker ? "팔로잉" : "+ 팔로우"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Primary Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 lg:self-center">
              {project.websiteUrl && (
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={() => recordProjectOutboundClick(project.id)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Globe className="h-4 w-4" />
                  <span>공식 웹사이트</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </a>
              )}

              {project.demoUrl && project.demoUrl !== project.websiteUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <Play className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                  <span>데모 체험</span>
                </a>
              )}

              {/* Like / Heart */}
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  project.isLiked
                    ? "border-rose-500/40 text-rose-500 bg-rose-500/10 shadow-sm"
                    : "border-border text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
                title={project.isLiked ? "좋아요 취소" : "좋아요"}
              >
                <Heart className={`h-4 w-4 ${project.isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                <span>{project.likesCount}</span>
              </button>

              {/* Views */}
              <span className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-muted bg-surface-muted/60 rounded-xl border border-border/50" title="조회수">
                <Eye className="h-3.5 w-3.5" />
                <span>{project.viewsCount}</span>
              </span>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted hover:bg-surface-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{copied ? "복사됨!" : "공유"}</span>
              </button>

              {/* Edit / Delete (Owner or Admin) */}
              {isOwner && (
                <div className="flex items-center gap-1.5 border-l border-border pl-2.5 ml-1">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="flex items-center gap-1 rounded-xl border border-border px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>수정</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: "project",
                        id: project.id,
                        description: `'${project.title}' 프로젝트와 관련된 모든 피드백, 댓글, 타임라인이 함께 영구 삭제됩니다.`,
                      })
                    }
                    className="flex items-center gap-1 rounded-xl border border-danger/30 bg-danger-soft/20 px-2.5 py-2 text-xs font-semibold text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Clean Secondary Tools Bar */}
          <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {project.websiteUrl && (
                <button
                  type="button"
                  onClick={() => setShowSandboxModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <Smartphone className="h-3.5 w-3.5 text-purple-500" />
                  <span>인앱 미리보기</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowBadgeModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>뱃지 발급</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCardNewsModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 text-rose-500" />
                <span>🎨 SNS 카드뉴스</span>
              </button>

              <button
                type="button"
                onClick={() => setShowViralModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-primary" />
                <span>바이럴 툴킷</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAiDevModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5 text-sky-500" />
                <span>AI 도구</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsEnglish(!isEnglish)}
              className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer ml-auto"
            >
              <Languages className="h-3.5 w-3.5 text-primary" />
              <span>{isEnglish ? "한국어 원문" : "🌐 English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs Content & Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Left Column: Tabs & Content */}
        <div>
          {/* Tabs Navigation */}
          <div className="mb-6 flex gap-1.5 overflow-x-auto border-b border-border pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Project Intro / Description */}
              <div className="rounded-card border border-border bg-surface p-6 sm:p-7 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>프로젝트 상세 소개</span>
                </h3>
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground font-normal">
                  {isEnglish
                    ? `[English Translation]\n\n${project.title} is an innovative software project showcased on zemix.\n\n${project.description || project.tagline}`
                    : (project.description || project.tagline)}
                </div>
              </div>

              {/* Project Status & Seeking Help/Roles */}
              <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>프로젝트 현황 및 찾는 동료</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stage Info */}
                  <div className="rounded-control border border-border bg-surface-muted/50 p-4">
                    <span className="text-xs font-semibold text-muted block mb-1">현재 개발 단계</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${stageInfo.badgeClass}`}>
                        {stageInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-2">
                      {stageInfo.desc}
                    </p>
                  </div>

                  {/* Looking For Help & Roles */}
                  <div className="rounded-control border border-border bg-surface-muted/50 p-4">
                    <span className="text-xs font-semibold text-muted block mb-1">모집 및 구하는 도움</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(project.lookingFor && project.lookingFor.length > 0) ? (
                        project.lookingFor.map((key) => {
                          const item = HELP_LABELS[key];
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20"
                            >
                              {item?.label || key}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-muted">현재 별도 모집 중인 역할이 없습니다.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshots Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Screenshots ({project.screenshots.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.screenshots.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className="overflow-hidden rounded-control border border-border cursor-pointer group bg-surface-muted"
                      >
                        <img
                          src={img}
                          alt={`Screenshot ${i + 1}`}
                          className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Category & Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted border border-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Maker Story Section */}
              <div className="mt-8 pt-6 border-t border-border">
                <MakerStoryTab project={project} />
              </div>
            </div>
          )}

          {/* TAB 2: FEEDBACK */}
          {activeTab === "feedback" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">사용자 피드백 보드</h3>
                  <p className="text-xs text-muted">
                    아이디어, 버그 리포트, 제안을 남겨 프로젝트 성장에 기여하세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      if (confirm("피드백을 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                        router.push(`/login?redirect=${encodeURIComponent(`/projects/${project.id}`)}`);
                      }
                      return;
                    }
                    setShowFeedbackModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  피드백 작성
                </button>
              </div>

              {/* Feedbacks List */}
              <div className="space-y-3">
                {feedbacks.length > 0 ? (
                  feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="flex items-start gap-4 rounded-card border border-border bg-surface p-4 shadow-sm"
                    >
                      {/* Upvote Button */}
                      <button
                        type="button"
                        onClick={() => handleUpvoteFeedback(fb.id)}
                        className={`flex flex-col items-center justify-center rounded-control border p-2 min-w-[48px] transition-colors cursor-pointer ${
                          fb.isUpvoted
                            ? "border-primary bg-primary-soft text-primary font-bold"
                            : "border-border bg-surface-muted text-muted hover:border-border-strong hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-xs mt-1">{fb.upvotes}</span>
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              fb.type === "idea"
                                ? "bg-primary-soft text-primary"
                                : fb.type === "bug"
                                ? "bg-danger-soft text-danger"
                                : fb.type === "praise"
                                ? "bg-success-soft text-success"
                                : "bg-warning-soft text-warning"
                            }`}
                          >
                            {fb.type}
                          </span>
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted">
                            {fb.status}
                          </span>
                          <div className="ml-auto flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">
                              {formatRelativeTime(fb.createdAt)}
                            </span>
                            {(user && (user.id === fb.userId || isOwner)) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "feedback",
                                    id: fb.id,
                                    description: `'${fb.title}' 피드백을 삭제하시겠습니까?`,
                                  })
                                }
                                className="text-muted hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                                title="피드백 삭제"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-semibold text-foreground">
                          {fb.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted leading-relaxed">
                          {fb.description}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <img
                            src={fb.userAvatar}
                            alt={fb.userName}
                            className="h-4 w-4 rounded-full object-cover"
                          />
                          <span className="font-medium text-foreground">{fb.userName}</span>
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-500 px-1.5 py-0.2 text-[10px] font-semibold border border-amber-500/20">
                            🌟 Top Reviewer
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-card border border-dashed border-border p-8 text-center text-muted">
                    아직 등록된 피드백이 없습니다. 첫 피드백을 남겨보세요!
                  </div>
                )}
              </div>
            </div>
          )}


          {/* TAB 3: COMMENTS */}
          {activeTab === "comments" && (
            <div className="space-y-6 animate-fade-in">
              {/* Add Comment Input */}
              {user ? (
                <form onSubmit={handleAddComment} className="rounded-card border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border border-border object-cover"
                    />
                    <div className="flex-1">
                      <textarea
                        rows={3}
                        placeholder="메이커에게 응원이나 질문을 남겨보세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full rounded-control border border-border bg-surface-muted/50 p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          댓글 등록
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="rounded-card border border-dashed border-border p-6 text-center bg-surface-muted/30">
                  <p className="text-sm text-muted">댓글을 남기려면 먼저 로그인해주세요.</p>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/projects/${project.id}`)}`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm"
                  >
                    로그인하고 댓글 남기기
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length > 0 ? (
                  comments.map((cm) => (
                    <div
                      key={cm.id}
                      className="rounded-card border border-border bg-surface p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={cm.userAvatar}
                            alt={cm.userName}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-foreground">
                            {cm.userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeTime(cm.createdAt)}
                          </span>
                          {(user && (user.id === cm.userId || isOwner)) && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "comment",
                                  id: cm.id,
                                  description: "이 댓글을 삭제하시겠습니까?",
                                })
                              }
                              className="text-muted hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                              title="댓글 삭제"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="pl-8 space-y-2">
                        <p className="text-xs text-muted leading-relaxed">
                          {translatedComments[cm.id] || cm.content}
                        </p>

                        {/* Feature 24: Smart Translation & Feature 47: Best Tip Upvote */}
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-muted">
                          <button
                            type="button"
                            onClick={() => {
                              setUpvotedComments((prev) => ({
                                ...prev,
                                [cm.id]: (prev[cm.id] || cm.likes || 0) + 1,
                              }));
                            }}
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>추천 {upvotedComments[cm.id] !== undefined ? upvotedComments[cm.id] : cm.likes}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (translatedComments[cm.id]) {
                                setTranslatedComments((prev) => {
                                  const copy = { ...prev };
                                  delete copy[cm.id];
                                  return copy;
                                });
                              } else {
                                // Simulate translation
                                const translated = `[Auto-Translated] ${cm.content} (Great insights and looking forward to updates!)`;
                                setTranslatedComments((prev) => ({ ...prev, [cm.id]: translated }));
                              }
                            }}
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                          >
                            <Languages className="h-3 w-3" />
                            <span>{translatedComments[cm.id] ? "원문 보기" : "번역하기"}</span>
                          </button>

                          {(upvotedComments[cm.id] || cm.likes) >= 2 && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 text-amber-500 px-1.5 py-0.2 font-bold text-[10px]">
                              <Award className="h-3 w-3" />
                              <span>베스트 팁 채택</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-card border border-dashed border-border p-8 text-center text-muted">
                    첫 번째 응원 댓글을 남겨보세요!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">프로젝트 타임라인</h3>
                  <p className="text-xs text-muted">
                    일회성 런칭이 아닌, 지속적으로 진화하는 프로젝트의 업데이트 일지입니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(true)}
                  className="flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  새 업데이트 기록
                </button>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {timeline.map((item) => (
                  <div key={item.id} className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />
                    <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-xs font-bold">
                          {item.version}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h4>
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "timeline",
                                  id: item.id,
                                  description: `'${item.title}' 업데이트 일지를 삭제하시겠습니까?`,
                                })
                              }
                              className="text-muted hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                              title="타임라인 삭제"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="whitespace-pre-line text-xs text-muted leading-relaxed mt-2">
                        {item.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INSIGHTS */}
          {activeTab === "insights" && (() => {
            const totalViews = project.viewsCount || 0;
            const outboundClicks = project.insights?.outboundClicks || 0;
            const allProjects = getProjects();
            const sortedProjects = [...allProjects].sort(
              (a, b) => (b.likesCount * 2 + b.viewsCount) - (a.likesCount * 2 + a.viewsCount)
            );
            const rankIndex = sortedProjects.findIndex((p) => p.id === project.id);
            const trendingRank = rankIndex >= 0 ? rankIndex + 1 : 1;

            // Generate last 7 days dynamically ending today
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              return {
                date: `${month}/${day}`,
                views: i === 6 ? totalViews : 0,
              };
            });
            const chartBars = (project.insights?.viewsByDay && project.insights.viewsByDay.length > 0)
              ? project.insights.viewsByDay
              : last7Days;

            const maxBarViews = Math.max(...chartBars.map((b) => b.views), 1);

            const hasCustomReferrers = project.insights?.referrers && project.insights.referrers.length > 0;
            const referrers = hasCustomReferrers
              ? project.insights!.referrers
              : totalViews === 0
              ? [
                  { source: "Zemix 메인 트렌딩 및 탐색", count: 0, percentage: 0 },
                  { source: "직접 접속 및 공유 링크", count: 0, percentage: 0 },
                  { source: "외부 유입 및 검색", count: 0, percentage: 0 },
                ]
              : [
                  {
                    source: "Zemix 메인 트렌딩 및 탐색",
                    count: Math.ceil(totalViews * 0.7),
                    percentage: Math.round((Math.ceil(totalViews * 0.7) / totalViews) * 100),
                  },
                  {
                    source: "직접 접속 및 공유 링크",
                    count: Math.max(0, totalViews - Math.ceil(totalViews * 0.7)),
                    percentage: Math.round((Math.max(0, totalViews - Math.ceil(totalViews * 0.7)) / totalViews) * 100),
                  },
                  {
                    source: "외부 유입 및 검색",
                    count: 0,
                    percentage: 0,
                  },
                ];

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">프로젝트 인사이트 분석</h3>
                    <p className="text-xs text-muted">
                      조회수, 좋아요, 트렌딩 순위 변화와 외부 트래픽 전환(/go/id)을 모니터링합니다.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    실시간 집계 중
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-card border border-border bg-surface p-4">
                    <p className="text-xs font-medium text-muted">총 조회수</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {totalViews}
                    </p>
                  </div>
                  <div className="rounded-card border border-border bg-surface p-4">
                    <p className="text-xs font-medium text-muted">총 좋아요</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {project.likesCount}
                    </p>
                  </div>
                  <div className="rounded-card border border-border bg-surface p-4">
                    <p className="text-xs font-medium text-muted">웹사이트 전환 클릭</p>
                    <p className="text-2xl font-bold text-success mt-1">
                      {outboundClicks}
                    </p>
                  </div>
                  <div className="rounded-card border border-border bg-surface p-4">
                    <p className="text-xs font-medium text-muted">트렌딩 랭킹</p>
                    <p className="text-2xl font-bold text-warning mt-1">
                      #{trendingRank}
                    </p>
                  </div>
                </div>

                {/* Views Chart Bar Visualization */}
                <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      최근 7일간 일일 조회수 추이
                    </h4>
                    <span className="text-xs text-muted">단위: Views</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-border">
                    {chartBars.map((bar, i) => {
                      const heightPercent = bar.views > 0
                        ? Math.min(100, Math.max(16, Math.round((bar.views / maxBarViews) * 100)))
                        : 6;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                            {bar.views}
                          </span>
                          <div
                            className={`w-full rounded-t-[4px] transition-all duration-300 ${
                              bar.views > 0
                                ? "bg-primary/80 group-hover:bg-primary"
                                : "bg-border/60 group-hover:bg-border"
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {bar.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Referrers */}
                <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    방문자 유입 경로 (Referrers)
                  </h4>
                  <div className="space-y-3">
                    {referrers.map((ref, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground">{ref.source}</span>
                          <span className="text-muted">{ref.count}회 ({ref.percentage}%)</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${ref.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}


        </div>

        {/* Right Sidebar: Maker Info & Meta */}
        <div className="space-y-6">
          {/* Maker Card */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
              Project Maker
            </p>
            <Link
              href={`/builders/${project.author?.id || project.author?.handle || ""}`}
              className="flex items-center gap-3 group hover:opacity-85 transition-opacity"
            >
              <img
                src={project.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=maker"}
                alt={project.author?.name || "Maker"}
                className="h-12 w-12 rounded-full border border-border object-cover group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {project.author?.name || "Maker"}
                </h3>
                <p className="text-xs text-muted truncate">@{project.author?.handle || "maker"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {project.author?.role || "Maker"}
                </p>
              </div>
            </Link>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              {project.author?.bio || "zemix 메이커"}
            </p>

            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`w-full rounded-control py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isFollowingMaker
                    ? "bg-surface-muted text-muted hover:text-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
                }`}
              >
                {isFollowingMaker ? "팔로잉 중" : "+ 팔로우"}
              </button>
              <button
                type="button"
                onClick={() => setShowCoffeeChatModal(true)}
                className="w-full rounded-control border border-border bg-surface-muted/50 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coffee className="h-3.5 w-3.5 text-amber-500" />
                <span>빌더와 15분 커피챗</span>
              </button>
            </div>
          </div>

          {/* User Interview & Tester Recruitment Card */}
          <div className="rounded-card border border-primary/20 bg-primary-soft/30 p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Coffee className="h-4 w-4" />
              <span>사용자 인터뷰 참여자 모집</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              서비스를 10분 체험하고 간단한 피드백을 주실 테스터를 모집합니다. (참여 시 스타벅스 기프티콘 증정 ☕)
            </p>
            <button
              onClick={() => alert("빌더에게 사용자 인터뷰 지원 의사를 전달했습니다!")}
              className="w-full rounded-xl bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer"
            >
              인터뷰 참여 신청하기
            </button>
          </div>

          {/* Project Details Box */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-sm text-xs space-y-3">
            <p className="font-semibold text-muted uppercase tracking-wider">
              About Project
            </p>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">개발 단계</span>
              <span className="font-semibold text-foreground">{stageInfo.label}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">등록일 (Launched)</span>
              <span className="text-foreground">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString("ko-KR") : "-"}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">팀원 모집 여부</span>
              <span className="font-medium text-foreground">
                {project.lookingForTeam ? "모집 중 (Active)" : "모집 안 함"}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">테스터 모집 여부</span>
              <span className="font-medium text-foreground">
                {project.lookingForTesters ? "모집 중 (Looking)" : "완료"}
              </span>
            </div>

            {project.teamChat?.url && (
              <div className="flex justify-between py-1">
                <span className="text-muted">소통 채널</span>
                <span className="font-medium text-foreground">{project.teamChat.platform || "Chat"}</span>
              </div>
            )}
          </div>

          {/* Collaboration & Recruitment Card */}
          {(project.lookingForTeam || project.lookingForTesters) && (
            <div className="rounded-card border border-primary/30 bg-primary/5 p-4 text-xs space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Users className="h-4 w-4" />
                <span>팀원 & 테스터 모집 중</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                현재 프로젝트를 함께 발전시킬 동료 및 베타 테스터를 찾고 있습니다.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.lookingFor && project.lookingFor.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20"
                  >
                    {HELP_LABELS[role]?.label || role}
                  </span>
                ))}
              </div>
              {project.teamChat?.url ? (
                <a
                  href={project.teamChat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-control bg-primary hover:bg-primary-hover text-white py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{project.teamChat.platform || "팀 소통 채널"} 참여하기</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCoffeeChatModal(true)}
                  className="w-full rounded-control bg-primary hover:bg-primary-hover text-white py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Coffee className="h-3.5 w-3.5" />
                  <span>메이커에게 참여 문의하기</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommended Similar Projects */}
      {relatedProjects.length > 0 && (
        <div className="mt-14 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base md:text-lg font-bold text-foreground">
                이 프로젝트를 본 분들이 함께 발견한 추천 서비스
              </h3>
              <p className="text-xs text-muted">비슷한 관심사의 인기 사이드 프로젝트를 둘러보세요.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {relatedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-popover">
            <h3 className="text-base font-bold text-foreground">새 피드백 작성</h3>
            <p className="text-xs text-muted mt-1">
              {project.title} 프로젝트에 전하고 싶은 피드백을 적어주세요.
            </p>

            <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  유형
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["idea", "bug", "suggestion", "praise"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFeedbackType(t)}
                      className={`rounded-control py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                        feedbackType === t
                          ? "bg-primary text-white"
                          : "bg-surface-muted text-muted hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="피드백 요약"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  상세 내용
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="자세한 피드백과 재현 방법 등을 적어주세요..."
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {feedbackType === "bug" && (
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">
                    🐛 발생 기기 및 환경 (QA 디바이스)
                  </label>
                  <select
                    value={bugDeviceInfo}
                    onChange={(e) => setBugDeviceInfo(e.target.value)}
                    className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Chrome (Desktop)">Chrome (PC 데스크탑)</option>
                    <option value="Safari (macOS)">Safari (Mac)</option>
                    <option value="iOS Safari (iPhone)">iOS Safari (아이폰)</option>
                    <option value="Android Chrome (Galaxy)">Android Chrome (갤럭시)</option>
                    <option value="Edge / 기타">Edge / 기타 브라우저</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymousFeedback"
                  checked={isAnonymousFeedback}
                  onChange={(e) => setIsAnonymousFeedback(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="anonymousFeedback" className="text-xs text-muted cursor-pointer select-none">
                  익명으로 솔직하게 남기기 (내 프로필 비공개 🕵️)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-muted cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-control bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover cursor-pointer"
                >
                  피드백 제출
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE UPDATE MODAL */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-popover">
            <h3 className="text-base font-bold text-foreground">새 릴리즈 / 업데이트 등록</h3>
            <p className="text-xs text-muted mt-1">
              새로운 기능이나 마일스톤 달성을 타임라인에 기록합니다.
            </p>

            <form onSubmit={handleSubmitUpdate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  버전 (예: v1.1.0)
                </label>
                <input
                  type="text"
                  required
                  value={updateVersion}
                  onChange={(e) => setUpdateVersion(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  업데이트 제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 다크 모드 지원 및 성능 개선"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  업데이트 내용
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="어떤 점이 달라졌는지 메이커 노트를 남겨보세요..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-muted cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-control bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover cursor-pointer"
                >
                  기록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <img
            src={selectedImage}
            alt="Screenshot"
            className="max-h-[90vh] max-w-[90vw] rounded-card object-contain shadow-2xl"
          />
        </div>
      )}

      {/* 6 POWER TOOL MODALS */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        projectId={project.id}
        projectTitle={project.title}
      />

      <SandboxModal
        isOpen={showSandboxModal}
        onClose={() => setShowSandboxModal(false)}
        websiteUrl={project.websiteUrl}
        projectTitle={project.title}
      />

      <CardNewsModal
        isOpen={showCardNewsModal}
        onClose={() => setShowCardNewsModal(false)}
        project={project}
      />

      <AiLaunchWriterModal
        isOpen={showAiLaunchModal}
        onClose={() => setShowAiLaunchModal(false)}
        project={project}
      />

      <SeoAuditModal
        isOpen={showSeoModal}
        onClose={() => setShowSeoModal(false)}
        project={project}
      />

      <CoffeeChatModal
        isOpen={showCoffeeChatModal}
        onClose={() => setShowCoffeeChatModal(false)}
        builder={project.author}
        projectTitle={project.title}
      />

      {/* Feature 1~8: Growth & Viral Toolkit Modal */}
      <GrowthAndViralModal
        isOpen={showViralModal}
        onClose={() => setShowViralModal(false)}
        project={project}
      />

      {/* Feature 17~25: AI Developer Suite Modal */}
      <AiDevSuiteModal
        isOpen={showAiDevModal}
        onClose={() => setShowAiDevModal(false)}
        project={project}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title="진짜 삭제 하시겠습니까?"
        description={
          deleteTarget?.description ||
          "삭제된 항목은 되돌릴 수 없으며, 모든 관련 데이터가 영구적으로 제거됩니다."
        }
        confirmLabel="삭제하기"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

