-- PlantMate Supabase schema
-- Supabase SQL Editor에서 한 번에 실행 가능하도록 구성했습니다.

-- 확장 기능
create extension if not exists pgcrypto;

-- 1. profiles 테이블
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. plants 테이블
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  summary text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 3. user_plants 테이블
create table if not exists public.user_plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  nickname text,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, plant_id, nickname)
);

-- 4. journals 테이블
create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_plant_id uuid not null references public.user_plants(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 5. posts 테이블
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 6. comments 테이블
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Foreign key 관계도
-- auth.users.id -> profiles.user_id
-- auth.users.id -> user_plants.user_id
-- public.plants.id -> user_plants.plant_id
-- public.user_plants.id -> journals.user_plant_id
-- auth.users.id -> posts.user_id
-- public.plants.id -> posts.plant_id
-- public.posts.id -> comments.post_id
-- auth.users.id -> comments.user_id

-- RLS 정책
-- profiles
alter table public.profiles enable row level security;
create policy "Allow owner select on profiles"
  on public.profiles
  for select
  using (user_id = auth.uid());

create policy "Allow owner insert on profiles"
  on public.profiles
  for insert
  with check (user_id = auth.uid());

create policy "Allow owner update on profiles"
  on public.profiles
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Allow owner delete on profiles"
  on public.profiles
  for delete
  using (user_id = auth.uid());

-- plants: 모두 조회 가능
alter table public.plants enable row level security;
create policy "Allow select on plants"
  on public.plants
  for select
  using (true);

create policy "Allow authenticated insert on plants"
  on public.plants
  for insert
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated update on plants"
  on public.plants
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated delete on plants"
  on public.plants
  for delete
  using (auth.role() = 'authenticated');

-- user_plants: 소유자만 조회/수정/삭제, 인증 사용자만 삽입
alter table public.user_plants enable row level security;
create policy "Allow authenticated insert on user_plants"
  on public.user_plants
  for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Allow owner select on user_plants"
  on public.user_plants
  for select
  using (user_id = auth.uid());

create policy "Allow owner update on user_plants"
  on public.user_plants
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Allow owner delete on user_plants"
  on public.user_plants
  for delete
  using (user_id = auth.uid());

-- journals: 공개 여부에 따라 조회 가능, 작성자는 자신의 user_plant에 한해 관리
alter table public.journals enable row level security;
create policy "Allow authenticated insert on journals"
  on public.journals
  for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.user_plants up
      where up.id = user_plant_id
        and up.user_id = auth.uid()
    )
  );

create policy "Allow public select on journals"
  on public.journals
  for select
  using (is_public = true);

create policy "Allow owner select on journals"
  on public.journals
  for select
  using (
    exists (
      select 1 from public.user_plants up
      where up.id = user_plant_id
        and up.user_id = auth.uid()
    )
  );

create policy "Allow owner update on journals"
  on public.journals
  for update
  using (
    exists (
      select 1 from public.user_plants up
      where up.id = user_plant_id
        and up.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_plants up
      where up.id = user_plant_id
        and up.user_id = auth.uid()
    )
  );

create policy "Allow owner delete on journals"
  on public.journals
  for delete
  using (
    exists (
      select 1 from public.user_plants up
      where up.id = user_plant_id
        and up.user_id = auth.uid()
    )
  );

-- posts: 모두 조회 가능, 작성자만 수정/삭제
alter table public.posts enable row level security;
create policy "Allow authenticated insert on posts"
  on public.posts
  for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Allow select on posts"
  on public.posts
  for select
  using (true);

create policy "Allow owner update on posts"
  on public.posts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Allow owner delete on posts"
  on public.posts
  for delete
  using (user_id = auth.uid());

-- comments: 모두 조회 가능, 작성자만 수정/삭제
alter table public.comments enable row level security;
create policy "Allow authenticated insert on comments"
  on public.comments
  for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Allow select on comments"
  on public.comments
  for select
  using (true);

create policy "Allow owner update on comments"
  on public.comments
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Allow owner delete on comments"
  on public.comments
  for delete
  using (user_id = auth.uid());

-- 테스트 데이터: plants 10종
insert into public.plants (name, category, summary, description) values
('몬스테라', '열대관엽', '공기정화에 좋은 실내 식물', '몬스테라는 밝은 간접광을 좋아하며 배수가 잘 되는 흙이 필요합니다.'),
('스투키', '다육식물', '초보자도 쉽게 기르는 실내 식물', '스투키는 햇빛이 적은 곳에서도 잘 자라며 물을 적게 줘도 됩니다.'),
('페퍼로미아', '다육식물', '작은 화분에 잘 어울리는 식물', '습도가 높은 환경에서 잘 자라며 밝은 간접광을 선호합니다.'),
('필로덴드론', '열대관엽', '넓은 잎으로 실내 분위기를 살리는 식물', '반그늘과 적당한 물주기로 관리하면 건강하게 자랍니다.'),
('몬스테라 델리시오사', '열대관엽', '큰 잎이 매력적인 관엽식물', '높은 습도와 밝은 간접광을 제공하면 잎이 더 크게 성장합니다.'),
('산세베리아', '공기정화', '강인한 공기정화 식물', '건조와 실내 환경에 강하며 물은 드물게 줍니다.'),
('디시디아', '행잉플랜트', '천장이나 선반에 어울리는 행잉 식물', '빛이 부족하면 성장이 느려지므로 밝은 위치가 적합합니다.'),
('칼라디움', '열대관엽', '색감 있는 잎이 특징인 실내식물', '습기가 많은 토양을 좋아하며 직사광선을 피해야 합니다.'),
('아이비', '덩굴식물', '공기정화와 실내 장식에 좋은 덩굴 식물', '부분적인 간접광 환경에서 잘 자랍니다.'),
('페튜니아', '꽃식물', '밝고 화사한 꽃을 피우는 화분 식물', '규칙적인 물주기와 충분한 햇빛이 필요합니다.');
