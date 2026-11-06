import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        <span>404 Error</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
        페이지를 찾을 수 없습니다
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted leading-relaxed">
        요청하신 페이지가 삭제되었거나, 주소가 변경되었을 수 있습니다.
        아래 버튼을 눌러 메인 화면이나 프로젝트 탐색으로 돌아가실 수 있습니다.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>홈으로 이동</span>
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
        >
          <Compass className="h-4 w-4" />
          <span>프로젝트 둘러보기</span>
        </Link>
      </div>
    </div>
  );
}
