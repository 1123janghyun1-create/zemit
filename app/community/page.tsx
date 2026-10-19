"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, Heart, Sparkles, Filter, Send, Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { CommunityPost } from "@/lib/types";
import { getCommunityPosts, addCommunityPost, deleteCommunityPost, fetchSharedCommunityPosts } from "@/lib/storage";
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
];

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

  // New post fields
  const [newCategory, setNewCategory] = useState<any>("General");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setPosts(getCommunityPosts());
    fetchSharedCommunityPosts().then(setPosts);

    const handleSync = () => fetchSharedCommunityPosts().then(setPosts);
    window.addEventListener("lumio_data_synced", handleSync);
    return () => window.removeEventListener("lumio_data_synced", handleSync);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await uploadToCloudinary(file);
      setNewImageUrl(url);
    } catch (err: any) {
      console.error("Community image upload error:", err);
      alert(`이미지 업로드 실패: ${err?.message || "파일을 확인해주세요."}`);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (confirm("글을 작성하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login?redirect=/community");
      }
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    const created = addCommunityPost({
      category: newCategory,
      title: newTitle,
      content: newContent,
      imageUrl: newImageUrl || undefined,
      author: user,
    });

    setPosts([created, ...posts]);
    setNewTitle("");
    setNewContent("");
    setNewImageUrl("");
    setShowModal(false);
  };

  const handleLikePost = (postId: string) => {
    if (!user) {
      if (confirm("좋아요를 누르려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login?redirect=/community");
      }
      return;
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const delta = p.isLiked ? -1 : 1;
          return {
            ...p,
            likesCount: Math.max(0, p.likesCount + delta),
            isLiked: !p.isLiked,
          };
        }
        return p;
      })
    );
  };

  const handleConfirmDeletePost = () => {
    if (!postToDelete) return;
    deleteCommunityPost(postToDelete.id);
    setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    setPostToDelete(null);
  };

  const filtered = posts.filter((p) =>
    selectedCategory === "All" ? true : p.category === selectedCategory
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            커뮤니티 라운지 (Community)
          </h1>
          <p className="mt-1 text-sm text-muted">
            사이드 프로젝트 개발기, 팀원 구인, 런칭 소식, 피드백 요청을 자유롭게 나눠보세요.
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
          className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          새 글 작성
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-border scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface text-muted border border-border hover:text-foreground hover:bg-surface-muted hover:border-border-strong"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((post) => (
            <div
              key={post.id}
              className="rounded-card border border-border bg-surface p-6 shadow-sm hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-[10px] font-bold">
                  {post.category}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                  {user && (user.id === post.author.id || user.handle === post.author.handle) && (
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-danger transition-colors cursor-pointer ml-1 p-0.5"
                      title="게시글 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>삭제</span>
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-semibold text-foreground mb-2">
                {post.title}
              </h3>

              <p className="text-xs text-muted leading-relaxed whitespace-pre-line mb-4">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-[10px] border border-border bg-surface-muted max-h-96">
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-full object-cover max-h-96 hover:scale-[1.01] transition-transform"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-6 w-6 rounded-full border border-border object-cover"
                  />
                  <span className="font-medium text-foreground">{post.author.name}</span>
                  <span className="text-[11px] text-muted-foreground">@{post.author.handle}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1 cursor-pointer transition-colors ${
                      post.isLiked ? "text-danger" : "hover:text-foreground"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${post.isLiked ? "fill-danger" : ""}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{post.commentsCount}</span>
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

      {/* NEW POST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-popover">
            <h3 className="text-base font-bold text-foreground">커뮤니티 글 작성</h3>
            <p className="text-xs text-muted mt-1">
              메이커들과 함께 나누고 싶은 이야기를 적어주세요.
            </p>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  게시판 카테고리
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="General">General (자유 수다)</option>
                  <option value="Show & Tell">Show & Tell (프로젝트 자랑)</option>
                  <option value="Feedback Request">Feedback Request (피드백 요청)</option>
                  <option value="Team Building">Team Building (팀원 구인)</option>
                  <option value="Tips & Insights">Tips & Insights (팁과 통찰)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="제목을 입력하세요"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  내용
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="내용을 자세히 작성해주세요..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Cloudinary Image Attachment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    이미지 첨부 (Cloudinary 지원)
                  </label>
                  <span className="text-[10px] text-muted-foreground">선택 사항</span>
                </div>

                {newImageUrl ? (
                  <div className="relative group inline-block rounded-[10px] overflow-hidden border border-border">
                    <img src={newImageUrl} alt="Preview" className="h-28 w-auto object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImageUrl("")}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-danger text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-1.5 rounded-control border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-border/60 cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingImage ? "Cloudinary 업로드 중..." : "이미지 파일 선택 (Cloudinary)"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-control px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-muted cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-control bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover cursor-pointer"
                >
                  등록하기
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

