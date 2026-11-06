"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Subtitles,
  Sparkles,
  Trophy,
  Smartphone,
  Share2,
  Users,
  ExternalLink,
  ChevronRight,
  Radio,
} from "lucide-react";
import { HexagonLogo } from "@/components/Icons";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Scene {
  id: number;
  timeRange: [number, number]; // [startSeconds, endSeconds]
  chapterTitle: string;
  narration: string;
  badge: string;
  headline: string;
  subheadline: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    timeRange: [0, 11],
    chapterTitle: "Intro & Vision",
    badge: "🚀 WELCOME TO ZEMIX",
    headline: "The Launchpad for Tech Builders",
    subheadline: "Stop letting your side projects gather dust on localhost. Meet your first 1,000 users.",
    narration:
      "Welcome to zemix. The launchpad and community platform built for tech creators, developers, and indie hackers.",
  },
  {
    id: 2,
    timeRange: [11, 23],
    chapterTitle: "Hall of Fame",
    badge: "🏆 REAL-TIME LEADERBOARD",
    headline: "Weekly & Monthly Hall of Fame",
    subheadline: "Transparent community upvotes highlighting the most innovative software every week.",
    narration:
      "Discover inspiring side projects before anyone else. Upvote your favorite builds and watch them rise to the weekly Hall of Fame.",
  },
  {
    id: 3,
    timeRange: [23, 35],
    chapterTitle: "Live Sandbox",
    badge: "🕹️ ZERO-REDIRECT PREVIEW",
    headline: "Interactive In-App Sandbox",
    subheadline: "Visitors can test-drive live web apps instantly inside an interactive modal.",
    narration:
      "Never lose users to endless redirects. With our live in-app sandbox, visitors can test-drive your web app instantly without leaving the page.",
  },
  {
    id: 4,
    timeRange: [35, 47],
    chapterTitle: "Viral Studio",
    badge: "🎨 CREATOR GROWTH SUITE",
    headline: "1-Click Card News & Dynamic Badges",
    subheadline: "Aesthetic promotional cards for Instagram, X, and LinkedIn, plus live GitHub README badges.",
    narration:
      "Supercharge your launch. Generate stunning SNS card news for Instagram and LinkedIn, plus live dynamic README badges for your GitHub repository.",
  },
  {
    id: 5,
    timeRange: [47, 60],
    chapterTitle: "Find Teammates",
    badge: "👥 TEAM & TESTERS",
    headline: "Recruit Collaborators & Ship Faster",
    subheadline: "Connect with co-founders, UI/UX designers, and beta testers ready to build together.",
    narration:
      "Recruit co-founders, gather structured user feedback, and stop building in the dark. Launch your dream project on zemix today!",
  },
];

const TOTAL_DURATION = 60; // 60 seconds

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenSceneRef = useRef<number | null>(null);

  // Initialize SpeechSynthesis and AudioContext
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Determine current active scene
  const currentSceneIndex = SCENES.findIndex(
    (s) => currentTime >= s.timeRange[0] && currentTime < s.timeRange[1]
  );
  const activeScene = SCENES[currentSceneIndex >= 0 ? currentSceneIndex : SCENES.length - 1];

  // Play subtle synth chime on scene transition
  const playSceneChime = useCallback(() => {
    if (isMuted || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable or blocked
    }
  }, [isMuted]);

  // English Voice Narration using SpeechSynthesis
  const speakCurrentScene = useCallback(
    (scene: Scene) => {
      if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(scene.narration);
      utterance.lang = "en-US";
      utterance.rate = playbackSpeed * 0.98;
      utterance.pitch = 1.02;

      // Select high-quality English voice if available
      const voices = synth.getVoices();
      const englishVoice =
        voices.find((v) => v.lang === "en-US" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      currentUtteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [isMuted, playbackSpeed]
  );

  // Trigger speech when scene changes while playing
  useEffect(() => {
    if (isPlaying && activeScene) {
      if (lastSpokenSceneRef.current !== activeScene.id) {
        lastSpokenSceneRef.current = activeScene.id;
        playSceneChime();
        speakCurrentScene(activeScene);
      }
    }
  }, [isPlaying, activeScene, speakCurrentScene, playSceneChime]);

  // Handle play / pause toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    } else {
      if (currentTime >= TOTAL_DURATION) {
        setCurrentTime(0);
        lastSpokenSceneRef.current = null;
      }
      setIsPlaying(true);
      lastTimestampRef.current = null;
      if (activeScene) {
        lastSpokenSceneRef.current = activeScene.id;
        playSceneChime();
        speakCurrentScene(activeScene);
      }
    }
  };

  // Main animation / progress loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestampRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSeconds = ((timestamp - lastTimestampRef.current) / 1000) * playbackSpeed;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaSeconds;
        if (next >= TOTAL_DURATION) {
          setIsPlaying(false);
          if (synthRef.current) synthRef.current.cancel();
          return TOTAL_DURATION;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Stop everything on close
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      lastSpokenSceneRef.current = null;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }
  }, [isOpen]);

  // Jump to specific scene chapter
  const handleSeekToScene = (scene: Scene) => {
    setCurrentTime(scene.timeRange[0]);
    lastSpokenSceneRef.current = scene.id;
    if (isPlaying) {
      playSceneChime();
      speakCurrentScene(scene);
    }
  };

  // Scrub bar click/drag
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * TOTAL_DURATION;
    setCurrentTime(newTime);

    const targetScene = SCENES.find(
      (s) => newTime >= s.timeRange[0] && newTime < s.timeRange[1]
    ) || SCENES[SCENES.length - 1];

    if (targetScene && isPlaying) {
      lastSpokenSceneRef.current = targetScene.id;
      playSceneChime();
      speakCurrentScene(targetScene);
    }
  };

  // Copy full English narration script
  const handleCopyScript = () => {
    const script = SCENES.map(
      (s, i) => `[${s.timeRange[0]}s - ${s.timeRange[1]}s] Chapter ${i + 1}: ${s.chapterTitle}\n"${s.narration}"`
    ).join("\n\n");

    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isOpen) return null;

  const progressPercent = (currentTime / TOTAL_DURATION) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={videoContainerRef}
        className="relative flex flex-col w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl overflow-hidden max-h-[96vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 shadow-md">
              <HexagonLogo className="h-4 w-4 text-white" strokeWidth={2.4} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">zemix Official Product Demo</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  60s Walkthrough
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-semibold text-slate-300">
                  ENG Voiceover
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive video walkthrough featuring AI voice narration & synced captions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/zemix-demo-video.mp4"
              download="zemix-demo-video.mp4"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer"
              title="MP4 비디오 파일 직접 다운로드 (LinkedIn 업로드용)"
            >
              <Download className="h-3.5 w-3.5" />
              <span>MP4 다운로드</span>
            </a>

            <button
              type="button"
              onClick={handleCopyScript}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="영문 내레이션 대본 복사"
            >
              {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedScript ? "대본 복사됨!" : "대본 복사"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage (16:9 Display) */}
        <div className="relative aspect-video w-full bg-gradient-to-b from-slate-950 via-[#070c1b] to-black overflow-hidden flex items-center justify-center select-none group">
          {/* Subtle Cybernetic Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Ambient Glowing Blobs */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/20 filter blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-600/20 filter blur-[100px] pointer-events-none animate-pulse" />

          {/* Top Left Watermark */}
          <div className="absolute top-4 left-5 flex items-center gap-2 z-20 pointer-events-none">
            <HexagonLogo className="h-4 w-4 text-cyan-400" strokeWidth={2.4} />
            <span className="text-xs font-extrabold tracking-wider text-slate-300 uppercase">zemix</span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] font-medium text-cyan-400">{activeScene.chapterTitle}</span>
          </div>

          {/* Top Right Live Recording / Play Status */}
          <div className="absolute top-4 right-5 z-20 flex items-center gap-2 pointer-events-none">
            {isPlaying && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                PLAYING
              </span>
            )}
            <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-white/10">
              {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
            </span>
          </div>

          {/* SCENE CONTENT RENDERING */}
          <div className="relative z-10 w-full max-w-3xl px-6 sm:px-12 text-center transition-all duration-700">
            {/* SCENE 1: Intro & Vision */}
            {activeScene.id === 1 && (
              <div className="flex flex-col items-center justify-center animate-fade-in space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-cyan-500 filter blur-xl opacity-40 animate-pulse" />
                  <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-400/40 shadow-2xl">
                    <HexagonLogo className="h-10 w-10 sm:h-12 sm:w-12 text-cyan-400" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 px-3 py-1 text-xs font-semibold text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{activeScene.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  {activeScene.headline}
                </h2>

                <p className="max-w-xl text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
                  {activeScene.subheadline}
                </p>

                {/* Floating Tech Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {["Next.js 16", "TypeScript", "Tailwind CSS", "Supabase", "AI Dev Suite"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SCENE 2: Real-time Leaderboard & Hall of Fame */}
            {activeScene.id === 2 && (
              <div className="flex flex-col items-center justify-center animate-fade-in space-y-4 w-full">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span>{activeScene.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {activeScene.headline}
                </h2>

                {/* Simulated Leaderboard Cards */}
                <div className="w-full max-w-lg space-y-2 pt-1 text-left">
                  {[
                    { rank: 1, title: "SchoolEcho", tag: "Beta", votes: 482, maker: "@minseok" },
                    { rank: 2, title: "DevCanvas AI", tag: "MVP", votes: 395, maker: "@hyun_jang" },
                    { rank: 3, title: "FlowLog Tech", tag: "Public", votes: 318, maker: "@sarah_dev" },
                  ].map((p) => (
                    <div
                      key={p.rank}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg hover:border-amber-400/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                            p.rank === 1
                              ? "bg-amber-400 text-black"
                              : p.rank === 2
                              ? "bg-slate-300 text-black"
                              : "bg-amber-700 text-white"
                          }`}
                        >
                          {p.rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-white">{p.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-semibold">
                              {p.tag}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{p.maker}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-400">
                        <span>▲</span>
                        <span>{p.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCENE 3: In-App Live Sandbox */}
            {activeScene.id === 3 && (
              <div className="flex flex-col items-center justify-center animate-fade-in space-y-4 w-full">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 px-3 py-1 text-xs font-semibold text-purple-300">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{activeScene.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {activeScene.headline}
                </h2>

                {/* Simulated Interactive Browser Frame */}
                <div className="w-full max-w-lg rounded-xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden text-left">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md bg-white/5 border border-white/10 px-3 py-0.5 text-[11px] text-slate-300 font-mono">
                      <span>https://schoolecho.app/demo</span>
                      <ExternalLink className="h-2.5 w-2.5 text-slate-500" />
                    </div>
                    <span className="text-[10px] text-purple-400 font-bold">100% Live</span>
                  </div>

                  <div className="p-5 flex flex-col items-center justify-center text-center space-y-2 bg-gradient-to-b from-slate-900/50 to-slate-950">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Test-Drive Any Project Right Here</h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Zero tab switching. Experience native prototypes in full responsive resolution.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 4: Creator Viral Studio */}
            {activeScene.id === 4 && (
              <div className="flex flex-col items-center justify-center animate-fade-in space-y-4 w-full">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-400/30 px-3 py-1 text-xs font-semibold text-rose-300">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{activeScene.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {activeScene.headline}
                </h2>

                {/* 3 Theme Mini Mockups */}
                <div className="grid grid-cols-3 gap-2.5 w-full max-w-lg pt-1">
                  <div className="p-3 rounded-xl border border-cyan-400/40 bg-[#070b19] text-left shadow-lg">
                    <span className="text-[10px] font-bold text-cyan-400">🌌 AURORA NEON</span>
                    <p className="text-[11px] font-bold text-white mt-1">High-Res Card</p>
                    <span className="text-[9px] text-slate-400">Instagram / Threads</span>
                  </div>

                  <div className="p-3 rounded-xl border border-rose-400/40 bg-[#1e0722] text-left shadow-lg">
                    <span className="text-[10px] font-bold text-rose-400">🌅 SUNSET GLOW</span>
                    <p className="text-[11px] font-bold text-white mt-1">Story & Reels</p>
                    <span className="text-[9px] text-slate-400">9:16 Full Screen</span>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-400/40 bg-[#021d17] text-left shadow-lg">
                    <span className="text-[10px] font-bold text-emerald-400">🌿 TECH MINT</span>
                    <p className="text-[11px] font-bold text-white mt-1">GitHub Badges</p>
                    <span className="text-[9px] text-slate-400">Live SVG Embeds</span>
                  </div>
                </div>

                {/* Dynamic GitHub Badge Preview */}
                <div className="inline-flex items-center gap-2 rounded-lg bg-black/70 border border-white/10 px-3.5 py-1.5 text-xs font-mono text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>[![Featured on zemix](https://zemix.vercel.app/badge/top)]</span>
                </div>
              </div>
            )}

            {/* SCENE 5: Find Teammates & Call to Action */}
            {activeScene.id === 5 && (
              <div className="flex flex-col items-center justify-center animate-fade-in space-y-4 w-full">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <Users className="h-3.5 w-3.5" />
                  <span>{activeScene.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {activeScene.headline}
                </h2>

                <p className="max-w-md text-xs sm:text-sm text-slate-300">
                  Stop building in the dark. Put your code in front of real users and passionate collaborators.
                </p>

                {/* Interactive Collaboration Cards */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/40 px-3.5 py-1 text-xs font-bold text-primary-soft">
                    👥 Looking for Frontend Dev
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 px-3.5 py-1 text-xs font-bold text-purple-300">
                    🧪 Looking for Beta Testers
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3.5 py-1 text-xs font-bold text-amber-300">
                    ☕ 1:1 Maker Coffee Chat
                  </span>
                </div>

                {/* Glowing Launch CTA */}
                <div className="pt-2">
                  <a
                    href="/projects/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-xl hover:scale-105 transition-transform"
                  >
                    <span>🚀 Launch Your Project on zemix</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Subtitles / Closed Captions Overlay */}
          {showSubtitles && (
            <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none flex justify-center">
              <div className="max-w-2xl rounded-xl bg-black/85 backdrop-blur-md border border-white/10 px-4 py-2 text-center shadow-lg transition-all">
                <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                  "{activeScene.narration}"
                </p>
              </div>
            </div>
          )}

          {/* Central Play/Pause Big Overlay on Hover when Paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group/play"
            >
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-2xl transition-transform group-hover/play:scale-110">
                <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1" />
              </div>
            </button>
          )}
        </div>

        {/* Video Scrubber & Playhead Bar */}
        <div
          onClick={handleScrub}
          className="relative h-2 w-full bg-white/10 hover:h-3 transition-all cursor-pointer group/scrub"
        >
          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Chapter markers */}
          {SCENES.map((scene) => {
            const leftPct = (scene.timeRange[0] / TOTAL_DURATION) * 100;
            return (
              <div
                key={scene.id}
                className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                style={{ left: `${leftPct}%` }}
                title={scene.chapterTitle}
              />
            );
          })}

          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 rounded-full bg-white shadow-md opacity-0 group-hover/scrub:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom Playback Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-900/90 border-t border-white/10 shrink-0">
          {/* Left: Play/Pause, Rewind, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              title={isPlaying ? "일시정지 (Space)" : "재생 (Space)"}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                lastSpokenSceneRef.current = null;
                if (isPlaying && activeScene) {
                  speakCurrentScene(SCENES[0]);
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="처음부터 다시 재생"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Mute / Unmute (Speech Synthesis + Chime) */}
            <button
              type="button"
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted && synthRef.current) {
                  synthRef.current.cancel();
                } else if (isMuted && isPlaying && activeScene) {
                  speakCurrentScene(activeScene);
                }
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isMuted ? "text-rose-400 bg-rose-500/10" : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title={isMuted ? "음소거 해제 (ENG Voice 켜기)" : "음소거 (Mute)"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Current Time Display */}
            <span className="text-xs font-mono text-slate-400">
              <strong className="text-white">{formatTime(currentTime)}</strong> / {formatTime(TOTAL_DURATION)}
            </span>
          </div>

          {/* Middle: Chapter Navigation Chips */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {SCENES.map((scene, i) => {
              const isActive = activeScene.id === scene.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => handleSeekToScene(scene)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {i + 1}. {scene.chapterTitle}
                </button>
              );
            })}
          </div>

          {/* Right: Speed, Subtitles, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={() => {
                const speeds = [1, 1.25, 1.5];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIdx]);
              }}
              className="px-2 py-1 rounded-md text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              title="재생 속도"
            >
              {playbackSpeed}x
            </button>

            {/* CC Subtitles toggle */}
            <button
              type="button"
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                showSubtitles ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-white hover:bg-white/10"
              }`}
              title="영어 자막(CC) 켜기/끄기"
            >
              <Subtitles className="h-4 w-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? "전체화면 종료" : "전체화면"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
