"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageSquare, ThumbsUp, CheckCheck } from "lucide-react";
import { NotificationItem } from "@/lib/types";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/notifications");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted">로그인 확인 중...</p>
      </div>
    );
  }

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (id: string) => {
    markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            알림 (Notifications)
          </h1>
          <p className="mt-1 text-sm text-muted">
            프로젝트에 달린 반응과 새로운 피드백 소식을 확인하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-muted hover:text-foreground cursor-pointer"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          모두 읽음 표시
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.link}
              onClick={() => handleItemClick(notif.id)}
              className={`flex items-start gap-3.5 rounded-card border p-4 transition-colors ${
                notif.read
                  ? "border-border bg-surface text-muted"
                  : "border-primary/30 bg-primary-soft/30 text-foreground font-medium"
              }`}
            >
              {notif.senderAvatar ? (
                <img
                  src={notif.senderAvatar}
                  alt=""
                  className="h-9 w-9 rounded-full border border-border object-cover shrink-0"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Bell className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{notif.title}</p>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
              )}
            </Link>
          ))
        ) : (
          <div className="text-center py-20 text-muted rounded-card border border-dashed border-border">
            새로운 알림이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

