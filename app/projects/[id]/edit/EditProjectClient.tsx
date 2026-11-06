"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Trash2,
  CheckCircle2,
  Globe,
  Plus,
  Save,
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import { getProjectById, updateProject, deleteProject, fetchSharedProjects } from "@/lib/storage";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Project, ProjectStatus } from "@/lib/types";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

const COVER_GRADIENT_PRESETS: [string, string][] = [
  ["#3B82F6", "#8B5CF6"],
  ["#22C55E", "#0EA5E9"],
  ["#F97316", "#F43F5E"],
  ["#A855F7", "#EC4899"],
  ["#0EA5E9", "#3B82F6"],
  ["#EF4444", "#F97316"],
  ["#3B82F6", "#22C55E"],
  ["#F43F5E", "#A855F7"],
];

const SUGGESTED_TAGS = [
  "AI",
  "SaaS",
  "Education",
  "Game",
  "Finance",
  "Productivity",
  "No-code",
  "Community",
  "Lifestyle",
  "Travel",
  "Developer Tools",
  "Design",
];

const STAGE_OPTIONS = [
  { value: "idea" as const, label: "Idea (아이디어)" },
  { value: "building" as const, label: "Building (개발 중)" },
  { value: "beta" as const, label: "Beta (베타)" },
  { value: "public" as const, label: "Public (공개 런칭)" },
];

const HELP_OPTIONS = [
  { value: "tester", label: "Tester (테스터)" },
  { value: "feedback", label: "Feedback (피드백)" },
  { value: "developer", label: "Developer (개발자)" },
  { value: "designer", label: "Designer (디자이너)" },
  { value: "cofounder", label: "Co-founder (공동창업자)" },
];

export default function EditProjectClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<"idea" | "building" | "beta" | "public">("building");
  const [coverImage, setCoverImage] = useState("");
  const [coverGradient, setCoverGradient] = useState<[string, string]>(COVER_GRADIENT_PRESETS[0]);
  const [logoImage, setLogoImage] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [demo, setDemo] = useState("");
  const [github, setGithub] = useState("");
  const [teamChatPlatform, setTeamChatPlatform] = useState<"Discord" | "Slack">("Discord");
  const [teamChatUrl, setTeamChatUrl] = useState("");

  // Upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;

    const populate = (p: Project) => {
      setProject(p);
      setName(p.title);
      setTagline(p.tagline);
      setDescription(p.description);
      setStage(p.stage || (p.status === "Public" ? "public" : p.status === "Beta" ? "beta" : "building"));
      setCoverImage(p.coverImage || "");
      setCoverGradient(p.coverGradient || COVER_GRADIENT_PRESETS[0]);
      setLogoImage(p.logo || "");
      setScreenshots(p.screenshots || []);
      setTags(p.tags || []);
      setLookingFor(p.lookingFor || []);
      setWebsite(p.websiteUrl || "");
      setDemo(p.demoUrl || "");
      setGithub(p.githubUrl || "");
      if (p.teamChat) {
        setTeamChatPlatform(p.teamChat.platform as any);
        setTeamChatUrl(p.teamChat.url);
      }
      setLoading(false);
    };

    const p = getProjectById(projectId);
    if (p) {
      populate(p);
    } else {
      fetchSharedProjects().then((all) => {
        const found = all.find((item) => item.id === projectId);
        if (found) {
          populate(found);
        } else {
          setLoading(false);
        }
      });
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h2 className="text-lg font-bold text-foreground">프로젝트를 찾을 수 없습니다.</h2>
        <Link
          href="/"
          className="mt-4 inline-block rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          홈으로 가기
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h2 className="text-lg font-bold text-foreground">로그인이 필요합니다</h2>
        <p className="mt-2 text-xs text-muted">
          프로젝트를 수정하려면 먼저 로그인해 주세요.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/projects/${projectId}/edit`)}`}
          className="mt-4 inline-block rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(
    user && (user.id === project.author.id || user.handle === project.author.handle || isAdmin)
  );

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h2 className="text-lg font-bold text-foreground">수정 권한이 없습니다</h2>
        <p className="mt-2 text-xs text-muted">
          자신이 생성한 프로젝트만 수정하거나 삭제할 수 있습니다.
        </p>
        <Link
          href={`/projects/${projectId}`}
          className="mt-4 inline-block rounded-control bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          프로젝트로 돌아가기
        </Link>
      </div>
    );
  }

  // Cloudinary upload handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const url = await uploadToCloudinary(file);
      setCoverImage(url);
    } catch (err: any) {
      alert(`커버 이미지 업로드 실패: ${err?.message || "파일을 확인해주세요."}`);
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const url = await uploadToCloudinary(file);
      setLogoImage(url);
    } catch (err: any) {
      alert(`로고 이미지 업로드 실패: ${err?.message || "파일을 확인해주세요."}`);
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (screenshots.length >= 5) {
      alert("스크린샷은 최대 5장까지 가능합니다.");
      return;
    }
    try {
      setUploadingScreenshot(true);
      const url = await uploadToCloudinary(file);
      setScreenshots((prev) => [...prev, url]);
    } catch (err: any) {
      alert(`스크린샷 업로드 실패: ${err?.message || "파일을 확인해주세요."}`);
    } finally {
      setUploadingScreenshot(false);
      e.target.value = "";
    }
  };

  const toggleTag = (t: string) => {
    if (tags.includes(t)) {
      setTags(tags.filter((item) => item !== t));
    } else {
      if (tags.length >= 5) {
        alert("태그는 최대 5개까지 가능합니다.");
        return;
      }
      setTags([...tags, t]);
    }
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setCustomTag("");
      return;
    }
    if (tags.length >= 5) {
      alert("태그는 최대 5개까지 등록할 수 있습니다.");
      return;
    }
    setTags([...tags, t]);
    setCustomTag("");
  };

  const toggleHelp = (h: string) => {
    if (lookingFor.includes(h)) {
      setLookingFor(lookingFor.filter((item) => item !== h));
    } else {
      setLookingFor([...lookingFor, h]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim()) {
      alert("프로젝트 이름과 한 줄 소개는 필수입니다.");
      return;
    }

    setSaving(true);

    let legacyStatus: ProjectStatus = "Public";
    if (stage === "idea") legacyStatus = "MVP";
    else if (stage === "building") legacyStatus = "Beta";
    else if (stage === "beta") legacyStatus = "Beta";

    try {
      const updated = await updateProject(
        projectId,
        {
          title: name.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          status: legacyStatus,
          stage,
          coverImage: coverImage.trim(),
          coverGradient,
          logo: logoImage.trim(),
          screenshots,
          tags,
          lookingFor,
          websiteUrl: website.trim(),
          demoUrl: (demo.trim() && demo.trim() !== website.trim()) ? demo.trim() : undefined,
          githubUrl: github.trim() || undefined,
          teamChat: teamChatUrl.trim()
            ? { platform: teamChatPlatform, url: teamChatUrl.trim() }
            : undefined,
          lookingForTeam: lookingFor.some((h) =>
            ["developer", "designer", "cofounder"].includes(h)
          ),
          lookingForTesters: lookingFor.includes("tester"),
        },
        project || undefined
      );

      if (updated) {
        alert("프로젝트 정보가 성공적으로 수정되었습니다.");
        router.push(`/projects/${projectId}`);
        router.refresh();
      } else {
        alert("프로젝트 정보를 수정하지 못했습니다. 다시 시도해 주세요.");
      }
    } catch (err: any) {
      console.error("Failed to update project:", err);
      alert(`수정 중 오류가 발생했습니다: ${err?.message || "다시 시도해 주세요."}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    deleteProject(projectId);
    setShowDeleteModal(false);
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-border text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              프로젝트 수정 (Edit Project)
            </h1>
            <p className="text-xs text-muted">
              {project.title} 프로젝트의 상세 정보를 변경할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Delete Project Button */}
        {isOwner && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            삭제하기
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            기본 정보
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              프로젝트 이름 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              한 줄 소개 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {tagline.length}/80
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              상세 소개 (Story & Problem)
            </label>
            <textarea
              rows={5}
              maxLength={1500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {description.length}/1500
            </p>
          </div>
        </div>

        {/* Media (Cloudinary) */}
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              대표 미디어 (Cloudinary 지원)
            </h2>
            <span className="text-[11px] text-muted">Cloudinary CDN (hesqv76c)</span>
          </div>

          {/* Cover */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              커버 배너 이미지
            </label>
            {coverImage ? (
              <div className="relative group overflow-hidden rounded-[8px] border border-border max-w-sm">
                <img src={coverImage} alt="Cover" className="aspect-video w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-1.5 rounded-[8px] border-2 border-dashed border-border bg-surface-muted hover:border-primary text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs font-medium">
                  {uploadingCover ? "업로드 중..." : "새 커버 이미지 업로드 (Cloudinary)"}
                </span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              프로젝트 로고 (아이콘)
            </label>
            <div className="flex items-center gap-3">
              {logoImage ? (
                <div className="relative group">
                  <img
                    src={logoImage}
                    alt="Logo"
                    className="h-14 w-14 rounded-[10px] border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoImage("")}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex h-14 w-14 items-center justify-center rounded-[10px] border-2 border-dashed border-border bg-surface-muted text-muted hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                {uploadingLogo ? "업로드 중..." : "로고 변경 (Cloudinary)"}
              </button>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Screenshots Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-foreground">
                스크린샷 갤러리 ({screenshots.length}/5)
              </label>
              {screenshots.length < 5 && (
                <button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  disabled={uploadingScreenshot}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  {uploadingScreenshot ? "업로드 중..." : "+ 스크린샷 추가"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {screenshots.map((s, idx) => (
                <div key={idx} className="relative group rounded-[8px] overflow-hidden border border-border aspect-video">
                  <img src={s} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshots(screenshots.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Stage & Tags */}
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            개발 단계 및 태그
          </h2>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              개발 단계
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STAGE_OPTIONS.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setStage(st.value)}
                  className={`rounded-control py-2 text-xs font-semibold cursor-pointer transition-colors ${
                    stage === st.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface border border-border text-muted hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              분야 태그 (최대 5개)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-primary-soft text-primary px-2.5 py-1 text-xs font-medium"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => toggleTag(t)}
                    className="hover:text-primary-hover cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SUGGESTED_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors cursor-pointer ${
                    tags.includes(t)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="직접 태그 입력"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="w-full max-w-xs rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="rounded-control border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted cursor-pointer"
              >
                추가
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              구하는 도움
            </label>
            <div className="flex flex-wrap gap-2">
              {HELP_OPTIONS.map((h) => {
                const isSelected = lookingFor.includes(h.value);
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => toggleHelp(h.value)}
                    className={`rounded-control px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border text-muted hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            링크 및 소통 채널
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                웹사이트 URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myproject.app"
                className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                GitHub 저장소 URL
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              팀 소통 채널 ({teamChatPlatform})
            </label>
            <div className="flex gap-2">
              <div className="flex shrink-0 overflow-hidden rounded-control border border-border">
                {(["Discord", "Slack"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTeamChatPlatform(p)}
                    className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      teamChatPlatform === p
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={teamChatUrl}
                onChange={(e) => setTeamChatUrl(e.target.value)}
                placeholder="초대 URL 링크"
                className="flex-1 rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-control px-4 py-2.5 text-xs font-medium text-muted hover:bg-surface-muted cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-control bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "저장 중..." : "수정사항 저장하기"}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal with "진짜 삭제 하시겠습니까?" */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="진짜 삭제 하시겠습니까?"
        description={`"${project.title}" 프로젝트와 관련된 모든 피드백, 댓글, 타임라인 기록이 함께 영구 삭제됩니다.`}
        confirmLabel="영구 삭제"
        cancelLabel="취소"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
