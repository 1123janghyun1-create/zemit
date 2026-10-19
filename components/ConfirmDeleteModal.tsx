"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = "진짜 삭제 하시겠습니까?",
  description = "삭제된 항목은 되돌릴 수 없으며, 모든 관련 데이터가 영구적으로 제거됩니다.",
  confirmLabel = "삭제하기",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-popover animate-scale-in"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-danger">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-soft">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="닫기"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted leading-relaxed mb-6">{description}</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-[var(--radius-control)] bg-danger px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
