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
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import {
  getProjectById,
  toggleProjectLike,
  recordProjectView,
  getFeedbacksByProject,
  addFeedback,
  toggleFeedbackUpvote,
  getCommentsByProject,
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

type TabType = "overview" | "feedback" | "comments" | "timeline" | "insights" | "collaborators";

export default function ProjectDetailClient({
  projectId,
}: {
  projectId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
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

  useEffect(() => {
    const proj = getProjectById(projectId);
    if (proj) {
      setProject(proj);
      recordProjectView(projectId);
      setFeedbacks(getFeedbacksByProject(projectId));
      setComments(getCommentsByProject(projectId));
      setTimeline(getTimelineByProject(projectId));
      setIsFollowingMaker(isBuilderFollowed(proj.author?.id));
    }

    // Always fetch latest shared project from server so any device can load it
    fetchSharedProjects().then((allProjects) => {
      const found = allProjects.find((p) => p.id === projectId);
      if (found) {
        setProject(found);
        setFeedbacks(getFeedbacksByProject(projectId));
        setComments(getCommentsByProject(projectId));
        setTimeline(getTimelineByProject(projectId));
        setIsFollowingMaker(isBuilderFollowed(found.author?.id));
      }
    });

    const handleSync = () => {
      const p = getProjectById(projectId);
      if (p) {
        setProject(p);
        setIsFollowingMaker(isBuilderFollowed(p.author?.id));
      }
      setFeedbacks(getFeedbacksByProject(projectId));
      setComments(getCommentsByProject(projectId));
      setTimeline(getTimelineByProject(projectId));
    };
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, [projectId]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-bold text-foreground">프로젝트를 찾을 수 없습니다</h2>
        <p className="mt-2 text-sm text-muted">삭제되었거나 잘못된 링크입니다.</p>
        <Link
          href="/"
          className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white"
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
    const result = toggleProjectLike(project.id);
    setProject((prev) => (prev ? { ...prev, likesCount: result.likesCount, isLiked: result.isLiked } : null));
  };

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
    if (!project?.author?.id) return;
    const res = toggleFollowBuilder(project.author.id);
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
    user && project && (user.id === project.author.id || user.handle === project.author.handle)
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
    if (!feedbackTitle.trim() || !feedbackDesc.trim()) return;

    const created = addFeedback({
      projectId: project.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type: feedbackType,
      title: feedbackTitle,
      description: feedbackDesc,
      status: "Open",
    });

    setFeedbacks([created, ...feedbacks]);
    setFeedbackTitle("");
    setFeedbackDesc("");
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
    { key: "overview", label: "Overview" },
    { key: "feedback", label: `Feedback (${feedbacks.length})` },
    { key: "comments", label: `Comments (${comments.length})` },
    { key: "timeline", label: `Timeline (${timeline.length})` },
    { key: "insights", label: "Insights" },
    { key: "collaborators", label: "Collaborators" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 animate-fade-in">
      {/* Project Card Header Box */}
      <div className="overflow-hidden rounded-[16px] border border-border shadow-card bg-surface">
        {/* Cover Banner */}
        <div
          className="aspect-video max-h-[360px] w-full"
          style={
            project.coverImage
              ? {
                  backgroundImage: `url(${project.coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: project.coverGradient
                    ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
                    : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                }
          }
        />

        {/* Info Header */}
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4 items-start">
              {project.logo ? (
                <img
                  src={project.logo}
                  alt={project.title}
                  className="h-16 w-16 shrink-0 rounded-[12px] border border-border object-cover shadow-sm bg-white"
                />
              ) : (
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] text-2xl font-bold text-white shadow-sm"
                  style={{
                    background: project.coverGradient
                      ? `linear-gradient(135deg, ${project.coverGradient[0]}, ${project.coverGradient[1]})`
                      : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                >
                  {(project.title || "P").slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                <div className="mb-2">
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-success-soft text-success">
                    {project.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {project.title}
                </h1>
                <p className="mt-2 max-w-2xl text-[15px] text-muted leading-relaxed">
                  {project.tagline}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex shrink-0 items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-[12px] border px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  project.isLiked
                    ? "border-danger text-danger bg-danger-soft"
                    : "border-border text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <Heart className={`h-4 w-4 ${project.isLiked ? "fill-danger" : ""}`} />
                <span>{project.likesCount}</span>
              </button>

              <span className="flex items-center gap-1 px-2 text-sm text-muted" title="Views">
                <Eye className="h-4 w-4" />
                <span>{project.viewsCount}</span>
              </span>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs">{copied ? "복사됨!" : "공유"}</span>
              </button>

              {isOwner && (
                <div className="flex items-center gap-1.5 sm:border-l sm:border-border sm:pl-2 sm:ml-1">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
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
                    className="flex items-center gap-1.5 rounded-[12px] border border-danger/40 bg-danger-soft/30 px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Links Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            {project.websiteUrl && (
              <a
                href={`/go/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-foreground">Website</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {project.websiteUrl.replace(/^https?:\/\//, "")}
                  </span>
                </span>
                <ExternalLink className="h-3 w-3 ml-1 text-muted" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold text-foreground">GitHub 저장소</span>
              </a>
            )}

            {/* Tracking Link display */}
            <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-surface-muted px-3 py-1.5 rounded-control">
              <span>추적 링크:</span>
              <code className="text-primary font-mono text-[11px]">
                zemit/go/{project.id}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs Content & Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Left Column: Tabs & Content */}
        <div>
          {/* Tabs Navigation */}
          <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "border-primary text-primary font-semibold"
                      : "border-transparent text-muted hover:text-foreground"
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
              <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  프로젝트 소개
                </h3>
                <div className="whitespace-pre-line text-[15px] leading-relaxed text-foreground">
                  {project.description}
                </div>
              </div>

              {/* Screenshots Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Screenshots
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.screenshots.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className="overflow-hidden rounded-control border border-border cursor-pointer group"
                      >
                        <img
                          src={img}
                          alt=""
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
                          <span>{fb.userName}</span>
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
                      <p className="text-xs text-muted leading-relaxed pl-8">
                        {cm.content}
                      </p>
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
          {activeTab === "insights" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-semibold text-foreground">프로젝트 인사이트 분석</h3>
                <p className="text-xs text-muted">
                  조회수, 좋아요, 트렌딩 순위 변화와 외부 트래픽 전환(/go/id)을 모니터링합니다.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs font-medium text-muted">총 조회수</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {project.insights?.viewsTotal || project.viewsCount}
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
                    {project.insights?.outboundClicks || 84}
                  </p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs font-medium text-muted">트렌딩 랭킹</p>
                  <p className="text-2xl font-bold text-warning mt-1">
                    #{project.insights?.trendingRank || 2}
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
                  {(project.insights?.viewsByDay || [
                    { date: "10/06", views: 40 },
                    { date: "10/07", views: 65 },
                    { date: "10/08", views: 90 },
                    { date: "10/09", views: 120 },
                    { date: "10/10", views: 145 },
                    { date: "10/11", views: 110 },
                    { date: "10/12", views: 98 },
                  ]).map((bar, i) => {
                    const heightPercent = Math.min(100, Math.max(15, (bar.views / 150) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.views}
                        </span>
                        <div
                          className="w-full rounded-t-[4px] bg-primary/80 group-hover:bg-primary transition-all duration-300"
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
                  {(project.insights?.referrers || [
                    { source: "Zemit 메인 트렌딩", count: 280, percentage: 54 },
                    { source: "외부 추적 링크 (/go)", count: 120, percentage: 23 },
                    { source: "소셜 미디어 / 디스코드", count: 75, percentage: 14 },
                    { source: "기타 / 검색", count: 45, percentage: 9 },
                  ]).map((ref, idx) => (
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
          )}

          {/* TAB 6: COLLABORATORS */}
          {activeTab === "collaborators" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">팀원 및 협업자</h3>
                  <p className="text-xs text-muted">
                    이 프로젝트를 함께 만들고 있는 빌더 목록입니다.
                  </p>
                </div>
                {project.lookingForTeam && (
                  <span className="rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold">
                    팀원 모집 중
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(project.collaborators || [
                  {
                    id: "collab-main",
                    name: project.author.name,
                    role: "Project Owner",
                    avatar: project.author.avatar,
                    handle: project.author.handle,
                    joinedAt: "2026-10-01",
                  },
                ]).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 shadow-sm"
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="h-10 w-10 rounded-full border border-border object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{c.name}</h4>
                      <p className="text-[11px] text-muted">@{c.handle}</p>
                      <span className="inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-muted mt-1">
                        {c.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {project.lookingForTeam && (
                <div className="rounded-card border border-primary/30 bg-primary-soft/40 p-5 text-center">
                  <h4 className="text-sm font-semibold text-primary">함께 프로젝트를 키워갈 팀원을 찾고 있습니다</h4>
                  <p className="text-xs text-muted mt-1">
                    {project.lookingForTeamRoles?.join(", ") || "프론트엔드, 디자이너, 마케터"}
                  </p>
                  <button
                    onClick={() => alert("메이커에게 팀 합류 신청 메시지를 전달했습니다!")}
                    className="mt-3 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer"
                  >
                    팀 합류 지원하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Maker Info & Meta */}
        <div className="space-y-6">
          {/* Maker Card */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
              Project Maker
            </p>
            <div className="flex items-center gap-3">
              <img
                src={project.author.avatar}
                alt={project.author.name}
                className="h-12 w-12 rounded-full border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {project.author.name}
                </h3>
                <p className="text-xs text-muted truncate">@{project.author.handle}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {project.author.role}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              {project.author.bio}
            </p>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
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
            </div>
          </div>

          {/* Project Details Box */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-sm text-xs space-y-3">
            <p className="font-semibold text-muted uppercase tracking-wider">
              About Project
            </p>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">상태 (Status)</span>
              <span className="font-semibold text-foreground">{project.status}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">등록일 (Launched)</span>
              <span className="text-foreground">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted">팀원 모집 여부</span>
              <span className="font-medium text-foreground">
                {project.lookingForTeam ? "모집 중 (Active)" : "모집 안 함"}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-muted">테스터 모집 여부</span>
              <span className="font-medium text-foreground">
                {project.lookingForTesters ? "모집 중 (Looking)" : "완료"}
              </span>
            </div>
          </div>
        </div>
      </div>

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

