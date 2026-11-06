"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  MessageSquare,
  Heart,
  Sparkles,
  Filter,
  Send,
  Upload,
  X,
  Image as ImageIcon,
  Trash2,
  Share2,
  ArrowLeft,
  CornerDownRight,
} from "lucide-react";
import { CommunityPost, CommentItem } from "@/lib/types";
import {
  getCommunityPosts,
  addCommunityPost,
  deleteCommunityPost,
  fetchSharedCommunityPosts,
  toggleCommunityLike,
} from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

const CATEGORIES = [
  "All",
  "General",
  "Show & Tell",
  "Feedback Request",
  "Team Building",
  "Tips & Insights",
  "Desk Setup & Gear",
];

function CommunityContent({ initialPosts = [] }: { initialPosts?: CommunityPost[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

  // Selected post for detail & comments modal
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [postComments, setPostComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // New post fields
  const [newCategory, setNewCategory] = useState<any>("General");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initial load
  useEffect(() => {
    if (initialPosts.length === 0) {
      setPosts(getCommunityPosts());
    }
    fetchSharedCommunityPosts(user?.id).then((list) => {
      setPosts(list);
      // Check query param ?post=...
      const queryPostId = searchParams.get("post");
      if (queryPostId) {
        const found = list.find((p) => p.id === queryPostId);
        if (found) {
          openPostDetail(found);
        }
      }
    });

    const handleSync = () => fetchSharedCommunityPosts(user?.id).then(setPosts);
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, [user?.id, initialPosts.length]);

  // Load comments whenever selectedPost changes
  const loadCommentsForPost = async (postId: string) => {
    try {
      setLoadingComments(true);
      const res = await fetch(`/api/comments?projectId=${encodeURIComponent(postId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPostComments(data);
        }
      }
    } catch (err) {
      console.error("Failed to load post comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const openPostDetail = (post: CommunityPost) => {
    setSelectedPost(post);
    loadCommentsForPost(post.id);
  };

  const closePostDetail = () => {
    setSelectedPost(null);
    setPostComments([]);
    setNewComment("");
  };

  // Handle Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadToCloudinary(file);
      setNewImageUrl(uploadedUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit New Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (confirm("글을 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login?redirect=/community");
      }
      return;
    }

    if (user.isBanned) {
      alert("관리자에 의해 계정이 밴(정지)되었습니다. 글을 작성할 수 없습니다.");
      return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    const created = addCommunityPost({
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      author: user,
      tags: [],
    });

    setPosts((prev) => [created, ...prev]);
    setShowModal(false);
    setNewTitle("");
    setNewContent("");
    setNewImageUrl("");
    setNewCategory("General");
  };

  const handleDeletePost = (post: CommunityPost, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPostToDelete(post);
  };

  const handleConfirmDeletePost = () => {
    if (!postToDelete) return;
    deleteCommunityPost(postToDelete.id);
    setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    if (selectedPost && selectedPost.id === postToDelete.id) {
      closePostDetail();
    }
    setPostToDelete(null);
  };

  const handleLikePost = (postId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!user) {
      if (confirm("좋아요를 누르려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login?redirect=/community");
      }
      return;
    }
    const result = toggleCommunityLike(postId, user.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likesCount: result.likesCount,
              isLiked: result.isLiked,
            }
          : p
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: result.likesCount,
              isLiked: result.isLiked,
            }
          : null
      );
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (confirm("댓글을 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(`/login?redirect=/community?post=${selectedPost?.id}`);
      }
      return;
    }

    if (user.isBanned) {
      alert("관리자에 의해 계정이 밴(정지)되었습니다. 댓글을 작성할 수 없습니다.");
      return;
    }

    if (!selectedPost || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedPost.id,
          content: newComment.trim(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          author: user,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setPostComments((prev) => [saved, ...prev]);
        setNewComment("");
        // Increment post commentsCount locally
        setPosts((prev) =>
          prev.map((p) =>
            p.id === selectedPost.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
          )
        );
        setSelectedPost((prev) =>
          prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null
        );
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("댓글 작성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPostComments((prev) => prev.filter((c) => c.id !== commentId));
        if (selectedPost) {
          const updatedCount = Math.max(0, (selectedPost.commentsCount || 1) - 1);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === selectedPost.id ? { ...p, commentsCount: updatedCount } : p
            )
          );
          setSelectedPost((prev) =>
            prev ? { ...prev, commentsCount: updatedCount } : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleSharePost = (post: CommunityPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert("게시글 링크가 클립보드에 복사되었습니다!");
  };

  const filteredPosts = posts.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            커뮤니티 (Community)
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            사이드 프로젝트 메이커들과 아이디어를 나누고, 피드백과 동료를 찾아보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              if (confirm("글을 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                router.push("/login?redirect=/community");
              }
              return;
            }
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-control bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          새 글 작성
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface text-muted border border-border hover:text-foreground hover:bg-surface-muted hover:border-border-strong"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => openPostDetail(post)}
              className="group block rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted border border-border">
                  {post.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                  {user && (user.id === post.author.id || user.handle === post.author.handle || isAdmin) && (
                    <button
                      type="button"
                      onClick={(e) => handleDeletePost(post, e)}
                      className="text-muted hover:text-danger p-1 transition-colors cursor-pointer"
                      title="삭제하기"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                {post.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-control border border-border max-w-md">
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-full object-cover max-h-72 group-hover:scale-[1.01] transition-transform"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted">
                {/* Author */}
                <div
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/builders/${post.author.id}`);
                  }}
                >
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-6 w-6 rounded-full border border-border object-cover"
                  />
                  <span className="font-medium text-foreground hover:underline">
                    {post.author.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">@{post.author.handle}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleLikePost(post.id, e)}
                    className={`flex items-center gap-1 cursor-pointer transition-colors ${
                      post.isLiked ? "text-rose-500 font-semibold" : "hover:text-foreground"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${post.isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{post.likesCount || 0}</span>
                  </button>

                  <span className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{post.commentsCount || 0}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-card border border-dashed border-border bg-surface-muted/20 px-6">
            <p className="text-sm font-semibold text-foreground">
              아직 등록된 게시글이 없습니다
            </p>
            <p className="mt-1 text-xs text-muted">
              첫 번째 이야기를 작성하여 커뮤니티의 문을 열어보세요!
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-4 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              새 글 작성하기
            </button>
          </div>
        )}
      </div>

      {/* DETAIL & COMMENTS MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-card border border-border bg-surface shadow-popover overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface shrink-0">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-muted">
                  {formatRelativeTime(selectedPost.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSharePost(selectedPost)}
                  className="rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
                  title="링크 복사"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                {user && (user.id === selectedPost.author.id || user.handle === selectedPost.author.handle || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(selectedPost)}
                    className="rounded-full p-1.5 text-muted hover:bg-danger-soft hover:text-danger transition-colors cursor-pointer"
                    title="게시글 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closePostDetail}
                  className="rounded-full p-1.5 text-muted hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3 leading-snug">
                  {selectedPost.title}
                </h2>

                {/* Author Card inside Modal */}
                <div
                  onClick={() => {
                    closePostDetail();
                    router.push(`/builders/${selectedPost.author.id}`);
                  }}
                  className="flex items-center gap-3 p-3 rounded-control border border-border bg-surface-muted/30 hover:bg-surface-muted/70 transition-colors cursor-pointer mb-5"
                >
                  <img
                    src={selectedPost.author.avatar}
                    alt={selectedPost.author.name}
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate hover:text-primary transition-colors">
                      {selectedPost.author.name}
                    </p>
                    <p className="text-xs text-muted truncate">
                      @{selectedPost.author.handle} · {selectedPost.author.role || "Maker"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">프로필 보기 →</span>
                </div>

                {/* Content */}
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </div>

                {/* Attached Image */}
                {selectedPost.imageUrl && (
                  <div className="mt-5 overflow-hidden rounded-control border border-border">
                    <img
                      src={selectedPost.imageUrl}
                      alt={selectedPost.title}
                      className="w-full object-contain max-h-[450px] bg-black/5"
                    />
                  </div>
                )}
              </div>

              {/* Likes & Comments Count Bar */}
              <div className="flex items-center gap-4 py-3 border-y border-border text-xs text-muted">
                <button
                  type="button"
                  onClick={() => handleLikePost(selectedPost.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control transition-colors cursor-pointer ${
                    selectedPost.isLiked
                      ? "bg-rose-500/10 text-rose-500 font-semibold border border-rose-500/30"
                      : "hover:bg-surface-muted text-muted hover:text-foreground border border-border"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${selectedPost.isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>좋아요</span>
                  <span className="font-semibold">{selectedPost.likesCount || 0}</span>
                </button>

                <div className="flex items-center gap-1.5 text-muted">
                  <MessageSquare className="h-4 w-4" />
                  <span>댓글</span>
                  <span className="font-semibold text-foreground">
                    {postComments.length || selectedPost.commentsCount || 0}
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">
                  댓글 ({postComments.length})
                </h3>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      user
                        ? "따뜻한 피드백이나 질문을 남겨보세요..."
                        : "댓글을 작성하려면 먼저 로그인해 주세요"
                    }
                    disabled={!user || submittingComment}
                    className="flex-1 rounded-control border border-border bg-surface px-3.5 py-2 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-surface-muted"
                  />
                  <button
                    type="submit"
                    disabled={!user || !newComment.trim() || submittingComment}
                    className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submittingComment ? "등록 중..." : "등록"}
                  </button>
                </form>

                {/* Comment Items */}
                {loadingComments ? (
                  <div className="py-6 text-center text-xs text-muted animate-pulse">
                    댓글 불러오는 중...
                  </div>
                ) : postComments.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {postComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3.5 rounded-control border border-border bg-surface-muted/20 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => {
                              closePostDetail();
                              const authorId = comment.userId || (comment as any).author?.id;
                              if (authorId) router.push(`/builders/${authorId}`);
                            }}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                          >
                            <img
                              src={
                                comment.userAvatar ||
                                (comment as any).author?.avatar ||
                                "https://api.dicebear.com/7.x/avataaars/svg?seed=" + comment.id
                              }
                              alt={comment.userName || (comment as any).author?.name || "사용자"}
                              className="h-5 w-5 rounded-full border border-border object-cover"
                            />
                            <span className="text-xs font-bold text-foreground hover:underline">
                              {comment.userName || (comment as any).author?.name || "사용자"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                            {user &&
                              (user.id === comment.userId ||
                                (comment as any).author?.id === user.id ||
                                isAdmin) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-muted hover:text-danger text-[10px] transition-colors cursor-pointer"
                                  title="댓글 삭제"
                                >
                                  삭제
                                </button>
                              )}
                          </div>
                        </div>
                        <p className="text-xs text-foreground/90 pl-7 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted border border-dashed border-border rounded-control">
                    아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-popover">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">새 커뮤니티 글 작성</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-1 text-muted hover:bg-surface-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  카테고리
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="General">General (자유 이야기)</option>
                  <option value="Show & Tell">Show & Tell (프로젝트 소개)</option>
                  <option value="Feedback Request">Feedback Request (피드백 요청)</option>
                  <option value="Team Building">Team Building (팀원 구하기)</option>
                  <option value="Tips & Insights">Tips & Insights (개발/메이킹 팁)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">제목</label>
                <input
                  type="text"
                  placeholder="공유하고 싶은 이야기의 제목을 적어주세요"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">본문</label>
                <textarea
                  rows={6}
                  placeholder="자세한 내용을 입력해 주세요. 피드백 요청 시 프로젝트 링크를 함께 남기면 더 좋습니다."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  required
                />
              </div>

              {/* Image Attachment with Cloudinary */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  이미지 첨부 (선택)
                </label>
                {newImageUrl ? (
                  <div className="relative mt-1 overflow-hidden rounded-control border border-border max-w-xs">
                    <img src={newImageUrl} alt="첨부 미리보기" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImageUrl("")}
                      className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-control p-3 text-xs text-muted hover:border-primary/50 hover:bg-surface-muted cursor-pointer transition-colors">
                    <ImageIcon className="h-4 w-4" />
                    <span>{uploadingImage ? "이미지 업로드 중..." : "이미지 파일 선택하여 업로드"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-control px-4 py-2 text-xs font-semibold text-muted hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || !newTitle.trim() || !newContent.trim()}
                  className="rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={postToDelete !== null}
        title="진짜 삭제 하시겠습니까?"
        description={`'${postToDelete?.title}' 글을 삭제하시겠습니까? 삭제된 커뮤니티 글은 복구할 수 없습니다.`}
        confirmLabel="삭제하기"
        cancelLabel="취소"
        onConfirm={handleConfirmDeletePost}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
}

export default function CommunityClient({ initialPosts = [] }: { initialPosts?: CommunityPost[] }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-12 animate-pulse">
          <div className="h-8 w-48 bg-surface-muted rounded mb-4" />
          <div className="h-4 w-72 bg-surface-muted rounded mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-surface-muted rounded-card" />
            <div className="h-32 bg-surface-muted rounded-card" />
          </div>
        </div>
      }
    >
      <CommunityContent initialPosts={initialPosts} />
    </Suspense>
  );
}
