"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { HexagonLogo } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read error parameter from URL if redirected from callback
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "auth_failed") {
        setErrorMessage("로그인 인증에 실패했습니다. 다시 시도해 주세요.");
      } else {
        setErrorMessage(decodeURIComponent(error));
      }
    }
  }, [searchParams]);

  // If already logged in, redirect to target or home
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const redirectTarget = searchParams.get("redirect") || "/";
      const { error } = await signInWithGoogle(redirectTarget);
      if (error) {
        console.error("Google sign-in error:", error);
        setErrorMessage(
          error.message || "Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("Login unexpected error:", err);
      setErrorMessage(err?.message || "예상치 못한 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-card space-y-6">
      {/* Logo & Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-surface border border-border text-foreground shadow-sm group-hover:scale-105 transition-all">
            <HexagonLogo className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" strokeWidth={2.2} />
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            zemit
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          zemit 시작하기
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          구글 계정으로 간편하게 로그인하고 사이드 프로젝트를 공유해보세요.
        </p>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="rounded-control bg-danger-soft border border-danger/20 p-3.5 text-xs text-danger flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-[11px] text-muted opacity-80 leading-relaxed">
              Supabase Authentication &gt; URL Configuration에 <br />
              <code className="bg-surface px-1 py-0.5 rounded font-mono text-[10px]">
                {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/auth/callback
              </code>
              가 등록되어 있는지 확인해주세요.
            </p>
          </div>
        </div>
      )}

      {/* Google Login Only */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting || authLoading}
          onClick={handleGoogleLogin}
          className="relative flex w-full items-center justify-center gap-3 rounded-control border border-border bg-surface py-3 px-4 text-xs font-semibold text-foreground hover:bg-surface-muted hover:border-foreground/20 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted" />
              <span>Google 로그인 페이지로 이동 중...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 계정으로 계속하기</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-border space-y-4 text-center">
        <p className="text-[11px] text-muted leading-relaxed">
          로그인 시 zemit의{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            서비스 이용약관
          </Link>{" "}
          및{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            개인정보 처리방침
          </Link>
          에 동의하게 됩니다.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-6 py-12 animate-fade-in">
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
