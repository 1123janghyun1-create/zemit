"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Send, Sparkles, Users, Coffee, Flame, Terminal } from "lucide-react";
import { LOUNGE_ROOMS } from "@/lib/platformData";
import { getLoungeMessages, sendLoungeMessage } from "@/lib/storage";
import { LoungeMessage } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function LoungeClient() {
  const { user } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState<string>("room-showcase");
  const [messages, setMessages] = useState<LoungeMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getLoungeMessages(activeRoomId));
  }, [activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const sender = user || {
      id: "guest-builder",
      name: "익명 빌더",
      handle: "guest_maker",
      avatar: "/icon.png",
      role: "Guest Maker",
      bio: "",
    };

    const updated = sendLoungeMessage(activeRoomId, sender, inputText.trim());
    setMessages(updated);
    setInputText("");
  };

  const activeRoom = LOUNGE_ROOMS.find((r) => r.id === activeRoomId) || LOUNGE_ROOMS[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-surface px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-lg font-bold text-foreground">실시간 빌더 라운지 (Live Lounge)</h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            전국의 사이드 프로젝트 메이커들과 함께 밤샘 코딩하며 실시간으로 피칭하고 소통하세요.
          </p>
        </div>

        {/* Room Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {LOUNGE_ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`rounded-control px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeRoomId === room.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-muted text-muted hover:text-foreground hover:bg-surface border border-border"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-4 mb-6">
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted bg-surface-muted/30">
            <strong>{activeRoom.name}</strong> 채널에 입장하셨습니다. — {activeRoom.description}
          </div>

          {messages.map((msg) => {
            const isMe = user?.id && msg.user.id === user.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <img
                  src={msg.user.avatar || "/icon.png"}
                  alt={msg.user.name}
                  className="h-8 w-8 rounded-full object-cover border border-border shrink-0 mt-0.5"
                />
                <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end text-right" : ""}`}>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="font-bold text-foreground">{msg.user.name}</span>
                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-mono">
                      {msg.user.role || "Builder"}
                    </span>
                    <span className="text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed inline-block text-left shadow-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-surface border border-border text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="sticky bottom-4 border border-border bg-surface rounded-2xl p-2 shadow-card flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${activeRoom.name} 채널에 한마디 남겨보세요... (예: 오늘 출시했습니다!)`}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
