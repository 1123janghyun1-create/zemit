# Lumio (루미오) — Meet users. Build together.

사이드 프로젝트 메이커 플랫폼 **Lumio**입니다.
아이디어에서 런칭까지, 사이드 프로젝트를 공유하고 첫 사용자를 만나 피드백을 받으며 팀원을 찾을 수 있는 플랫폼입니다.

---

## 🚀 주요 기능

- **🏠 홈 피드 (`/`)**
  - 오늘의 추천 프로젝트 (Featured Today) 배너
  - 실시간 검색 & 카테고리 필터 (Popular, Newest, Most Liked, Recently Updated, Looking for Testers, Looking for Team)
  - 반응형 프로젝트 카드 그리드 (좋아요, 피드백, 팔로워 카운트)

- **🔍 탐색 (`/explore`)**
  - 세부 카테고리 태그 (AI, SaaS, Game, Developer Tools 등) & 상태 필터링 (Public, Beta, MVP, 팀원 모집, 테스터 모집)
  - 다중 정렬 (인기순, 최신순, 좋아요순, 업데이트순)

- **📄 프로젝트 상세 (`/projects/[id]`)**
  - **Overview**: 프로젝트 상세 스토리, 기능 설명, 스크린샷 갤러리 (라이트박스 뷰어)
  - **Feedback**: 유저 아이디어 / 버그 리포트 / 개선 제안 등록 및 투표 (Upvote) 시스템
  - **Comments**: 메이커와 유저 간의 실시간 댓글 소통
  - **Timeline**: 버전별 마일스톤 업데이트 일지 및 메이커 노트
  - **Insights**: 일일 조회수 추이 바 차트, 트래픽 유입 경로 (Referrers), 외부 링크 전환율 분석
  - **Collaborators**: 프로젝트 팀원 목록 및 "팀원 모집 중" 지원하기

- **➕ 프로젝트 등록 (`/projects/new`)**
  - 서비스명, 태그라인, 상태, 태그, 웹사이트 & GitHub 링크
  - Cloudinary 이미지 업로드 (로고, 커버 배너, 스크린샷)
  - 팀원 및 테스터 모집 플래그 설정

- **🔗 외부 사이트 전환 추적 링크 (`/go/[id]`)**
  - 외부 서비스로 넘어가는 트래픽을 자동으로 기록하고 리디렉션하는 트래킹 라우트

- **👥 빌더스 디렉토리 (`/builders`)**
  - 메이커 프로필, Starting Member 뱃지, 등록 프로젝트 수, 팔로우 기능

- **💬 커뮤니티 라운지 (`/community`)**
  - Show & Tell, Feedback Request, Team Building, Tips & Insights 게시판

- **📊 내 활동 (`/activity`) & 알림 (`/notifications`)**
  - 내 프로젝트, 좋아요 목록, 남긴 피드백 및 알림 피드

- **🌓 다크 모드 & 🌐 다국어 지원 (한국어 / English)**

---

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (Lumio 디자인 시스템 및 컬러 팔레트 준수)
- **Icons**: Lucide React
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Media Storage**: Cloudinary (이미지 업로드 및 최적화)
- **Deployment**: Vercel

---

## 💻 로컬 실행 방법

```bash
# 1. 의존성 설치 (이미 설치되어 있음)
npm install

# 2. 로컬 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

---

## ⚡ Supabase 연동 방법 (나중에 연결할 때)

1. [Supabase](https://supabase.com)에 로그인 후 새 프로젝트를 생성합니다.
2. Supabase 대시보드의 **SQL Editor**로 이동합니다.
3. 본 프로젝트 루트의 `supabase/schema.sql` 파일 내용을 복사하여 실행합니다. (테이블, 인덱스, RLS 보안 정책이 자동 생성됩니다.)
4. `.env.local` 파일을 생성하고 아래 환경 변수를 입력합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

*※ Supabase 설정 전에도 내장된 로컬 스토리지 & 데모 데이터 엔진을 통해 모든 기능(좋아요, 댓글, 피드백, 프로젝트 등록, 계정 전환)이 즉시 완벽하게 작동합니다.*

---

## ☁️ Cloudinary 연동 방법

1. [Cloudinary](https://cloudinary.com) 무료 계정을 생성합니다.
2. **Settings > Upload > Upload Presets**에서 Unsigned 프리셋을 생성합니다.
3. `.env.local`에 아래 항목을 추가합니다:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🌐 Vercel 배포 및 도메인 연결

1. GitHub 저장소에 코드를 푸시합니다.
2. [Vercel](https://vercel.com)에서 해당 저장소를 Import합니다.
3. Environment Variables에 위 `.env.local`의 값들을 등록합니다.
4. **Deploy**를 클릭하면 완료됩니다!
5. **Settings > Domains**에서 원하는 커스텀 도메인을 연결할 수 있습니다.
