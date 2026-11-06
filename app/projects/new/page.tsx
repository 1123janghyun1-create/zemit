"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  Globe,
  Plus,
  PartyPopper,
  Image as ImageIcon,
} from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import { saveProject } from "@/lib/storage";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ProjectStatus } from "@/lib/types";

// Gradient Presets identical to cozit.app
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
  {
    value: "idea" as const,
    label: "Idea (아이디어)",
    description: "아직 구현 전인 아이디어 및 컨셉 구상 단계",
  },
  {
    value: "building" as const,
    label: "Building (개발 중)",
    description: "현재 활발히 기능 개발 및 제작이 진행 중인 프로젝트",
  },
  {
    value: "beta" as const,
    label: "Beta (베타 테스트)",
    description: "실제 동작하며 초기 사용자의 피드백을 수집 중인 상태",
  },
  {
    value: "public" as const,
    label: "Public (공식 런칭)",
    description: "누구나 사용할 수 있도록 안정적으로 배포된 공식 서비스",
  },
];

const HELP_OPTIONS = [
  {
    value: "tester",
    label: "Tester (테스터)",
    description: "서비스를 직접 사용해보고 버그나 사용성을 피드백해줄 테스터",
  },
  {
    value: "feedback",
    label: "Feedback (피드백)",
    description: "기획 방향성, UX, 아이디어에 대한 의견을 나눠줄 동료",
  },
  {
    value: "developer",
    label: "Developer (개발자)",
    description: "프론트엔드/백엔드 기능 구현을 함께 완성할 개발 팀원",
  },
  {
    value: "designer",
    label: "Designer (디자이너)",
    description: "UI/UX 디자인, 브랜딩, 그래픽 에셋 작업을 함께할 디자이너",
  },
  {
    value: "cofounder",
    label: "Co-founder (공동창업자)",
    description: "비즈니스와 장기적인 비전을 함께 키워갈 공동 창업 파트너",
  },
];

const STEP_LABELS = [
  "기본 정보",
  "커버 & 로고",
  "태그",
  "개발 단계",
  "구하는 도움",
  "링크 & 게시",
];

export default function NewProjectWizard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/projects/new");
    }
  }, [loading, user, router]);

  if (user?.isBanned) {
    return (
      <div className="mx-auto max-w-lg px-6 py-28 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger mb-4">
          <X className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">활동이 정지된 계정입니다</h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          관리자에 의해 커뮤니티 정책 위반으로 계정이 밴(정지) 처리되어 새로운 프로젝트를 등록할 수 없습니다.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-control bg-surface-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface border border-border cursor-pointer"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Draft Data State
  const [draft, setDraft] = useState({
    name: "",
    tagline: "",
    description: "",
    coverGradient: COVER_GRADIENT_PRESETS[0],
    coverImage: "",
    logoImage: "",
    screenshots: [] as string[],
    tags: [] as string[],
    stage: "building" as "idea" | "building" | "beta" | "public",
    lookingFor: [] as string[],
    website: "",
    demo: "",
    github: "",
    teamChatPlatform: "Discord" as "Discord" | "Slack",
    teamChatUrl: "",
  });

  // Upload States
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [zoomScreenshot, setZoomScreenshot] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const updateDraft = (fields: Partial<typeof draft>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
  };

  // Cloudinary Upload Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const url = await uploadToCloudinary(file);
      updateDraft({ coverImage: url });
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
      updateDraft({ logoImage: url });
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
    if (draft.screenshots.length >= 5) {
      alert("스크린샷은 최대 5장까지 업로드할 수 있습니다.");
      return;
    }
    try {
      setUploadingScreenshot(true);
      const url = await uploadToCloudinary(file);
      updateDraft({ screenshots: [...draft.screenshots, url] });
    } catch (err: any) {
      alert(`스크린샷 업로드 실패: ${err?.message || "파일을 확인해주세요."}`);
    } finally {
      setUploadingScreenshot(false);
      e.target.value = "";
    }
  };

  // Tag helpers
  const toggleTag = (tag: string) => {
    if (draft.tags.includes(tag)) {
      updateDraft({ tags: draft.tags.filter((t) => t !== tag) });
    } else {
      if (draft.tags.length >= 5) {
        alert("태그는 최대 5개까지 선택할 수 있습니다.");
        return;
      }
      updateDraft({ tags: [...draft.tags, tag] });
    }
  };

  const addCustomTag = () => {
    const t = customTagInput.trim();
    if (!t) return;
    if (draft.tags.includes(t)) {
      setCustomTagInput("");
      return;
    }
    if (draft.tags.length >= 5) {
      alert("태그는 최대 5개까지 등록할 수 있습니다.");
      return;
    }
    updateDraft({ tags: [...draft.tags, t] });
    setCustomTagInput("");
  };

  // Help toggle
  const toggleHelpOption = (val: string) => {
    if (draft.lookingFor.includes(val)) {
      updateDraft({ lookingFor: draft.lookingFor.filter((item) => item !== val) });
    } else {
      updateDraft({ lookingFor: [...draft.lookingFor, val] });
    }
  };

  // Validation
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return draft.name.trim().length > 0 && draft.tagline.trim().length > 0;
      case 4:
        return !!draft.stage;
      default:
        return true;
    }
  };

  // Final Publish Handler
  const handlePublish = async () => {
    if (!user) {
      router.push("/login?redirect=/projects/new");
      return;
    }
    setIsSubmitting(true);

    // Map stage to legacy ProjectStatus
    let legacyStatus: ProjectStatus = "Public";
    if (draft.stage === "idea") legacyStatus = "MVP";
    else if (draft.stage === "building") legacyStatus = "Beta";
    else if (draft.stage === "beta") legacyStatus = "Beta";

    const newProject = saveProject({
      title: draft.name.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim() || draft.tagline.trim(),
      status: legacyStatus,
      stage: draft.stage,
      logo: draft.logoImage || "",
      coverImage: draft.coverImage || "",
      coverGradient: draft.coverGradient,
      screenshots: draft.screenshots,
      websiteUrl: draft.website.trim() || "https://zemix.app",
      demoUrl: (draft.demo.trim() && draft.demo.trim() !== draft.website.trim()) ? draft.demo.trim() : undefined,
      githubUrl: draft.github.trim() || undefined,
      teamChat: draft.teamChatUrl.trim()
        ? { platform: draft.teamChatPlatform, url: draft.teamChatUrl.trim() }
        : undefined,
      author: user,
      tags: draft.tags.length > 0 ? draft.tags : ["SideProject"],
      lookingFor: draft.lookingFor,
      lookingForTeam: draft.lookingFor.some((h) =>
        ["developer", "designer", "cofounder"].includes(h)
      ),
      lookingForTeamRoles: draft.lookingFor.filter((h) =>
        ["developer", "designer", "cofounder"].includes(h)
      ),
      lookingForTesters: draft.lookingFor.includes("tester"),
    });

    setIsSubmitting(false);
    setCreatedProjectId(newProject.id);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted">로그인 확인 중...</p>
      </div>
    );
  }

  // Post-publish Success Screen (identical to cozit.app)
  if (createdProjectId) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center animate-fade-in">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-primary-soft text-primary shadow-sm">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {draft.name} 프로젝트가 등록되었습니다!
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          프로젝트가 성공적으로 배포되었습니다. 이제 동료 메이커들의 피드백을 받고 첫 사용자를 만나보세요.
        </p>

        <div className="mt-5 w-full rounded-[var(--radius-control)] border border-primary/20 bg-primary-soft/40 p-4 text-xs font-medium text-primary text-left">
          💡 <strong>트래픽 공유 팁:</strong> 상세 페이지 상단의 공유 버튼을 눌러 피드백을 모으거나 팀원 모집 링크를 SNS에 공유해보세요.
        </div>

        <div className="mt-8 flex w-full flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push(`/projects/${createdProjectId}`)}
            className="flex-1 rounded-[var(--radius-control)] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover cursor-pointer transition-colors"
          >
            프로젝트 상세 보기
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 rounded-[var(--radius-control)] border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted cursor-pointer transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 animate-fade-in">
      {/* Wizard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          새 프로젝트 등록하기
        </h1>
        <p className="mt-1 text-sm text-muted">
          아이디어부터 런칭된 서비스까지, 메이커의 프로젝트를 공유해보세요.
        </p>
      </div>

      {/* 6-Step Indicator (cozit.app Style) */}
      <div className="mb-8 flex items-center">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isCurrent = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary-soft text-primary ring-2 ring-primary"
                      : "bg-surface-muted border border-border text-muted font-medium"
                  }`}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span
                  className={`hidden text-[11px] font-medium sm:block ${
                    isCurrent ? "text-foreground font-semibold" : "text-muted font-medium"
                  }`}
                >
                  {label}
                </span>
              </div>

              {stepNum !== STEP_LABELS.length && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                    isDone ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Step Card Container */}
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card sm:p-8">
        {/* ==================================================================== */}
        {/* STEP 1: BASICS                                                       */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                프로젝트 기본 정보를 입력해주세요
              </h2>
              <p className="mt-1 text-sm text-muted">
                프로젝트 이름과 한 줄 소개는 탐색 화면에 가장 먼저 노출됩니다.
              </p>
            </div>

            {/* AI Smart Fill Assistant */}
            <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shrink-0">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-xs font-bold text-foreground">AI 스마트 요약 & 태그 자동 완성</span>
                  <p className="text-[11px] text-muted">프로젝트 이름만 넣고 클릭하면 AI가 매력적인 한 줄 소개와 설명, 추천 태그를 채워줍니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentName = draft.name.trim() || "Awesome Project";
                  updateDraft({
                    name: currentName,
                    tagline: draft.tagline || `${currentName} - 세상을 더 편리하게 만드는 혁신적인 사이드 프로젝트`,
                    description: draft.description || `${currentName}은 사용자의 일상을 개선하기 위해 정성껏 개발된 최신 웹앱입니다. 복잡한 과정 없이 웹에서 바로 동작하며, 초기 피드백을 환영합니다.`,
                    tags: draft.tags.length > 0 ? draft.tags : ["AI", "SaaS", "Productivity"],
                  });
                }}
                className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI로 자동 채우기</span>
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                프로젝트 이름 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="예: Zemix, Cozit, PageRivet"
                className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                한 줄 소개 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={draft.tagline}
                onChange={(e) => updateDraft({ tagline: e.target.value })}
                placeholder="프로젝트를 가장 잘 설명하는 한 문장"
                className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {draft.tagline.length}/80
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                상세 소개 (Story & Problem)
              </label>
              <textarea
                rows={5}
                maxLength={1500}
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                placeholder="어떤 문제를 해결하고자 만들었는지, 주요 기능은 무엇인지 자세히 설명해주세요."
                className="w-full resize-none rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {draft.description.length}/1500
              </p>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: COVER & LOGO & SCREENSHOTS (Cloudinary Integration)          */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  대표 이미지와 로고를 등록해주세요
                </h2>
                <p className="mt-1 text-sm text-muted">
                  커버 이미지가 없으면 선택한 그라디언트 배경이 기본 적용됩니다.
                </p>
              </div>
              <span className="hidden sm:inline-flex rounded-full bg-primary-soft text-primary px-2.5 py-0.5 text-[10px] font-bold">
                Cloudinary 연동
              </span>
            </div>

            {/* Cover Image Upload */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                커버 배너 이미지{" "}
                <span className="font-normal text-muted-foreground">(16:9 비율 권장, Cloudinary 자동 업로드)</span>
              </p>

              {draft.coverImage ? (
                <div>
                  <div className="relative group overflow-hidden rounded-[var(--radius-card)] border border-border">
                    <img
                      src={draft.coverImage}
                      alt="Cover preview"
                      className="aspect-video w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => updateDraft({ coverImage: "" })}
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                      title="커버 이미지 삭제"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingCover ? "Cloudinary에 업로드 중..." : "커버 이미지 변경"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-border text-muted transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary cursor-pointer disabled:cursor-not-allowed"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">
                    {uploadingCover ? "Cloudinary에 업로드 중..." : "커버 이미지 업로드 (Cloudinary)"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WebP 지원 (최대 10MB)
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

            {/* Gradient Presets */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {draft.coverImage
                  ? "커버 이미지를 제거하고 사용할 기본 그라디언트"
                  : "기본 그라디언트 배경 선택"}
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {COVER_GRADIENT_PRESETS.map(([from, to]) => {
                  const isSelected =
                    !draft.coverImage &&
                    draft.coverGradient[0] === from &&
                    draft.coverGradient[1] === to;
                  return (
                    <button
                      key={`${from}-${to}`}
                      type="button"
                      onClick={() =>
                        updateDraft({
                          coverGradient: [from, to],
                          coverImage: "",
                        })
                      }
                      className={`h-12 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          : "hover:opacity-90"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${from}, ${to})`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                프로젝트 로고 (아이콘){" "}
                <span className="font-normal text-muted-foreground">(1:1 정사각형 권장)</span>
              </p>
              <div className="flex items-center gap-4">
                {draft.logoImage ? (
                  <div className="relative group">
                    <img
                      src={draft.logoImage}
                      alt="Logo preview"
                      className="h-16 w-16 rounded-[var(--radius-control)] border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => updateDraft({ logoImage: "" })}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] border-2 border-dashed border-border text-muted hover:border-primary hover:bg-primary-soft hover:text-primary transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="text-sm font-medium text-primary hover:text-primary-hover cursor-pointer"
                  >
                    {uploadingLogo ? "Cloudinary 업로드 중..." : "로고 이미지 업로드 (Cloudinary)"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    128x128px 이상의 정사각형 권장
                  </p>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Screenshots Gallery Upload */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  스크린샷 ({draft.screenshots.length}/5)
                </p>
                {draft.screenshots.length < 5 && (
                  <button
                    type="button"
                    onClick={() => screenshotInputRef.current?.click()}
                    disabled={uploadingScreenshot}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    {uploadingScreenshot ? "업로드 중..." : "스크린샷 추가"}
                  </button>
                )}
              </div>
              <p className="mb-3 text-xs text-muted">
                서비스 화면 스크린샷을 최대 5장까지 Cloudinary에 업로드하여 사용자들에게 미리 보여줄 수 있습니다.
              </p>

              {draft.screenshots.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {draft.screenshots.map((s, idx) => (
                    <div key={idx} className="group relative">
                      <button
                        type="button"
                        onClick={() => setZoomScreenshot(s)}
                        className="block w-full cursor-zoom-in rounded-[var(--radius-control)] overflow-hidden border border-border"
                      >
                        <img
                          src={s}
                          alt={`Screenshot ${idx + 1}`}
                          className="aspect-video w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft({
                            screenshots: draft.screenshots.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </div>

            {/* Live Card Preview Box (Cozit Style) */}
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">
                탐색 카드 미리보기
              </p>
              <p className="mb-2 text-xs text-muted-foreground">
                목록 및 피드에 실제로 노출되는 카드 상단 모습입니다.
              </p>
              <div
                className="relative flex aspect-video w-full max-w-[300px] items-end overflow-hidden rounded-[var(--radius-card)] border border-border p-4 shadow-sm"
                style={
                  draft.coverImage
                    ? {
                        backgroundImage: `url(${draft.coverImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {
                        background: `linear-gradient(135deg, ${draft.coverGradient[0]}, ${draft.coverGradient[1]})`,
                      }
                }
              >
                {draft.logoImage ? (
                  <img
                    src={draft.logoImage}
                    alt=""
                    className="relative h-9 w-9 shrink-0 rounded-[10px] border border-white/40 object-cover shadow-sm bg-surface"
                  />
                ) : (
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/90 text-sm font-semibold text-gray-900 shadow-sm">
                    {(draft.name || "L").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: TAGS                                                         */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                어떤 분야의 프로젝트인가요?
              </h2>
              <p className="mt-1 text-sm text-muted">
                최대 5개의 태그를 선택하거나 직접 추가하여 프로젝트의 정체성을 알려주세요.
              </p>
            </div>

            {/* Selected Tags Display */}
            {draft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draft.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="rounded-full hover:text-primary-hover cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">추천 카테고리 태그</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((t) => {
                  const isSelected = draft.tags.includes(t);
                  const isMax = !isSelected && draft.tags.length >= 5;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isMax}
                      onClick={() => toggleTag(t)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground"
                      } ${isMax ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">직접 태그 입력</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="예: WebEditor, Extension, LLM"
                  disabled={draft.tags.length >= 5}
                  className="flex-1 rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={draft.tags.length >= 5 || !customTagInput.trim()}
                  className="rounded-[var(--radius-control)] border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: STAGE                                                        */}
        {/* ==================================================================== */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                현재 어떤 단계인가요?
              </h2>
              <p className="mt-1 text-sm text-muted">
                프로젝트의 현재 진행 상황을 알려주시면 알맞은 피드백과 동료를 찾을 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STAGE_OPTIONS.map((st) => {
                const isSelected = draft.stage === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => updateDraft({ stage: st.value })}
                    className={`rounded-[var(--radius-card)] border p-4 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary-soft shadow-sm ring-1 ring-primary"
                        : "border-border bg-surface hover:bg-surface-muted"
                    }`}
                  >
                    <p
                      className={`text-[15px] font-semibold ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {st.label}
                    </p>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {st.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: HELP                                                         */}
        {/* ==================================================================== */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                어떤 도움이 필요하신가요?
              </h2>
              <p className="mt-1 text-sm text-muted">
                동료나 사용자에게 요청하고 싶은 협업 분야를 선택하세요 (복수 선택 가능).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HELP_OPTIONS.map((h) => {
                const isSelected = draft.lookingFor.includes(h.value);
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => toggleHelpOption(h.value)}
                    className={`rounded-[var(--radius-card)] border p-4 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary-soft shadow-sm ring-1 ring-primary"
                        : "border-border bg-surface hover:bg-surface-muted"
                    }`}
                  >
                    <p
                      className={`text-[15px] font-semibold ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {h.label}
                    </p>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {h.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 6: LINKS & PUBLISH                                              */}
        {/* ==================================================================== */}
        {currentStep === 6 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                외부 링크 및 최종 확인
              </h2>
              <p className="mt-1 text-sm text-muted">
                사용자가 방문할 수 있는 서비스 링크를 입력하고 등록을 완료하세요.
              </p>
            </div>

            {/* Links Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  웹사이트 / 서비스 링크
                </label>
                <input
                  type="url"
                  value={draft.website}
                  onChange={(e) => updateDraft({ website: e.target.value })}
                  placeholder="https://yourproject.app"
                  className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  데모 URL (선택)
                </label>
                <input
                  type="url"
                  value={draft.demo}
                  onChange={(e) => updateDraft({ demo: e.target.value })}
                  placeholder="https://yourproject.app/demo"
                  className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground flex items-center gap-1.5">
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub 저장소 (선택)
                </label>
                <input
                  type="url"
                  value={draft.github}
                  onChange={(e) => updateDraft({ github: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Team Chat */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  팀 소통 채널 (Discord / Slack)
                </label>
                <div className="flex gap-2">
                  <div className="flex shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-border">
                    {(["Discord", "Slack"] as const).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => updateDraft({ teamChatPlatform: platform })}
                        className={`px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          draft.teamChatPlatform === platform
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface text-muted hover:bg-surface-muted"
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={draft.teamChatUrl}
                    onChange={(e) => updateDraft({ teamChatUrl: e.target.value })}
                    placeholder="https://discord.gg/your-invite"
                    className="flex-1 rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary Review Card (Cozit Style) */}
            <div className="rounded-[var(--radius-card)] border border-border bg-surface-muted p-5 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                등록 내용 최종 요약
              </p>
              <div className="flex flex-col gap-2 text-xs sm:text-sm">
                <p>
                  <span className="text-muted">프로젝트 이름:</span>{" "}
                  <span className="font-semibold text-foreground">{draft.name || "—"}</span>
                </p>
                <p>
                  <span className="text-muted">한 줄 소개:</span>{" "}
                  <span className="font-medium text-foreground">{draft.tagline || "—"}</span>
                </p>
                <p>
                  <span className="text-muted">개발 단계:</span>{" "}
                  <span className="font-medium text-foreground capitalize">
                    {draft.stage}
                  </span>
                </p>
                <p>
                  <span className="text-muted">선택 태그:</span>{" "}
                  <span className="font-medium text-foreground">
                    {draft.tags.length > 0 ? draft.tags.join(", ") : "선택 안 됨"}
                  </span>
                </p>
                <p>
                  <span className="text-muted">구하는 도움:</span>{" "}
                  <span className="font-medium text-foreground">
                    {draft.lookingFor.length > 0 ? draft.lookingFor.join(", ") : "없음"}
                  </span>
                </p>
                {draft.teamChatUrl && (
                  <p>
                    <span className="text-muted">팀 채널:</span>{" "}
                    <span className="font-medium text-foreground">
                      {draft.teamChatPlatform} ({draft.teamChatUrl})
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Final Publish Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="w-full rounded-[var(--radius-control)] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "프로젝트 게시 중..." : "프로젝트 게시하기 (Publish)"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              게시 후에도 프로젝트 상세 페이지에서 언제든지 내용을 수정할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Wizard Navigation Footer (Next / Back) */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          disabled={currentStep === 1}
          className={`flex items-center gap-1 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground cursor-pointer transition-colors ${
            currentStep === 1 ? "invisible" : ""
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          이전 (Back)
        </button>

        {currentStep < 6 && (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 6))}
            disabled={!canGoNext()}
            className="flex items-center gap-1 rounded-[var(--radius-control)] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음 (Next)
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {zoomScreenshot && (
        <div
          onClick={() => setZoomScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative max-h-[85vh] max-w-full">
            <img
              src={zoomScreenshot}
              alt="Zoomed screenshot"
              className="max-h-[85vh] max-w-full rounded-[var(--radius-card)] object-contain shadow-popover"
            />
            <button
              type="button"
              onClick={() => setZoomScreenshot(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
