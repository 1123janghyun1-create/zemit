"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Save, Check, Globe } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, loading } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [handle, setHandle] = useState(user?.handle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [role, setRole] = useState(user?.role || "Developer");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [github, setGithub] = useState(user?.socials?.github || "");
  const [website, setWebsite] = useState(user?.socials?.website || "");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [loading, user, router]);

  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setHandle(user.handle || "");
      setBio(user.bio || "");
      setRole(user.role || "Developer");
      setAvatar(user.avatar || "");
      setGithub(user.socials?.github || "");
      setWebsite(user.socials?.website || "");
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setAvatar(url);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      alert(`프로필 이미지 업로드 실패: ${err?.message || "파일을 확인해주세요."}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updated = {
      ...user,
      name: name.trim() || user.name,
      handle: handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || user.handle,
      bio: bio.trim(),
      role: role.trim() || "Developer",
      avatar: avatar || user.avatar,
      socials: {
        github: github.trim(),
        website: website.trim(),
      },
    };

    await updateUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted">로그인 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          프로필 설정 (Profile)
        </h1>
        <p className="mt-1 text-sm text-muted">
          Zemit 커뮤니티와 프로젝트에 노출되는 빌더 정보를 수정합니다.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-card border border-border bg-surface p-6 shadow-sm space-y-6">
          {/* Avatar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-foreground">
                  프로필 아바타
                </label>
                <span className="inline-flex items-center rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[10px] font-bold">
                  Cloudinary 연동
                </span>
              </div>
              {avatar && avatar.includes("cloudinary.com") && (
                <span className="text-[11px] text-success font-medium">✓ Cloudinary 저장됨</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <img
                src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt=""
                className="h-20 w-20 rounded-full border border-border object-cover shadow-sm"
              />
              <div className="space-y-2">
                <label className="inline-flex items-center gap-1.5 rounded-control bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-sm hover:bg-primary-hover cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Cloudinary에 업로드 중..." : "새 이미지 업로드 (Cloudinary)"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-muted-foreground">
                  선택한 파일은 hesqv76c Cloudinary CDN에 즉시 업로드됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                이름 / 닉네임
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                아이디 (Handle)
              </label>
              <div className="flex items-center rounded-control border border-border bg-surface px-2.5 focus-within:border-primary">
                <span className="text-xs text-muted">@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-transparent p-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              역할 / 직군 (Role)
            </label>
            <input
              type="text"
              placeholder="예: Full-stack Developer, Product Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              소개글 (Bio)
            </label>
            <textarea
              rows={3}
              placeholder="어떤 사이드 프로젝트를 만들고 계신지 간단히 적어주세요..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <GithubIcon className="h-3.5 w-3.5" />
                GitHub 링크
              </label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <Globe className="h-3.5 w-3.5 text-primary" />
                개인 웹사이트
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-control border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-success font-medium">
              <Check className="h-4 w-4" /> 저장 완료!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-control bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            변경사항 저장
          </button>
        </div>
      </form>
    </div>
  );
}

