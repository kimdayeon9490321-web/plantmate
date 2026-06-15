# PlantMate

Next.js 15 App Router 기반의 PlantMate 프로젝트입니다. TypeScript, Tailwind CSS, Supabase 연동 기본 구조를 포함합니다.

## 주요 기능
- 회원가입 / 로그인
- 식물 도감 조회
- 식물 검색
- 내 식물 등록
- 성장일지 작성
- 공개/비공개 설정
- 식물별 커뮤니티
- 댓글 기능

## 설치
1. `npm install`
2. `.env` 파일에 다음 환경 변수를 추가

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. `npm run dev`로 개발 서버 실행

## 폴더 구조
- `app/`
  - `page.tsx` - 홈
  - `plants/` - 식물 목록
  - `plants/[id]/page.tsx` - 식물 상세
  - `my-plants/` - 내 식물 목록
  - `my-plants/[id]/page.tsx` - 성장일지 목록
  - `community/` - 게시글 목록
  - `post/[id]/page.tsx` - 게시글 상세
  - `mypage/` - 내 정보
  - `login/` - 로그인
  - `signup/` - 회원가입
- `components/`
  - `Shell.tsx` - 기본 레이아웃 및 네비게이션
- `lib/`
  - `supabaseClient.ts` - Supabase 클라이언트
