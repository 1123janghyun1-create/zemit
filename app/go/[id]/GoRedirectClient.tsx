"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { getProjectById, recordProjectOutboundClick } from "@/lib/storage";
import { ExternalLink } from "lucide-react";

export default function GoRedirectClient({ projectId }: { projectId: string }) {
  const project = getProjectById(projectId);

  useEffect(() => {
    if (project && project.websiteUrl) {
      recordProjectOutboundClick(projectId);
      const timer = setTimeout(() => {
        window.location.href = project.websiteUrl;
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [project, projectId]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-bold text-foreground">프로젝트를 찾을 수 없습니다</h2>
        <Link href="/" className="mt-4 text-sm text-primary hover:underline">
          Zemix 홈으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-fade-in">
      <div className="rounded-card border border-border bg-surface p-8 max-w-md shadow-card">
        <img
          src={project.logo}
          alt={project.title}
          className="h-16 w-16 mx-auto rounded-[12px] border border-border object-cover mb-4"
        />
        <h2 className="text-lg font-bold text-foreground">
          {project.title} 웹사이트로 이동 중...
        </h2>
        <p className="mt-2 text-xs text-muted">
          잠시 후 외부 서비스 사이트({project.websiteUrl})로 자동 연결됩니다.
        </p>

        <a
          href={project.websiteUrl}
          className="mt-5 inline-flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          바로 이동하기
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

