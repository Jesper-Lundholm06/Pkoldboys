-- PK Oldboys Bowling — database schema
--
-- HOW TO RUN: open the Supabase dashboard for this project, go to
-- SQL Editor, paste this entire file, and click "Run". Safe to re-run
-- (uses "if not exists" / "or replace" where possible), but it will error
-- on the CREATE TABLE / CREATE POLICY statements if they already exist.
--
-- If you already ran this file in Step 2 (news/documents/member_posts exist),
-- you only need to run the NEW "matches" table + its policies added in
-- Step 4 (search for "Added in Step 4" below) — running the whole file again
-- will error on the already-existing policies.
--
-- Auth model assumed by the policies below:
--   - One ADMIN account: admin@pkoldboys.se (full write access everywhere)
--   - One shared MEMBER account: medlem@pkoldboys.se (read-only, member content)
--   - Public (anonymous) visitors can read news and documents

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null, -- path in Storage
  category text,           -- e.g. 'dokument', 'tavlingar'
  created_at timestamptz not null default now()
);

create table if not exists member_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Added in Step 4: exchange matches shown on "Våra aktiviteter" (public read)
create table if not exists matches (
  id bigint generated always as identity primary key,
  date text not null,
  time text not null,
  home text not null,
  away text not null,
  location text not null,
  result text not null default ''
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table news enable row level security;
alter table documents enable row level security;
alter table member_posts enable row level security;
alter table matches enable row level security;

-- news: public read, admin-only write
create policy "news_select_public"
  on news for select
  using (true);

create policy "news_insert_admin"
  on news for insert
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "news_update_admin"
  on news for update
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se')
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "news_delete_admin"
  on news for delete
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

-- documents: public read, admin-only write
create policy "documents_select_public"
  on documents for select
  using (true);

create policy "documents_insert_admin"
  on documents for insert
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "documents_update_admin"
  on documents for update
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se')
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "documents_delete_admin"
  on documents for delete
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

-- member_posts: any authenticated user can read, admin-only write
create policy "member_posts_select_authenticated"
  on member_posts for select
  using (auth.role() = 'authenticated');

create policy "member_posts_insert_admin"
  on member_posts for insert
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "member_posts_update_admin"
  on member_posts for update
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se')
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "member_posts_delete_admin"
  on member_posts for delete
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

-- matches: public read, admin-only write
create policy "matches_select_public"
  on matches for select
  using (true);

create policy "matches_insert_admin"
  on matches for insert
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "matches_update_admin"
  on matches for update
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se')
  with check ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');

create policy "matches_delete_admin"
  on matches for delete
  using ((auth.jwt() ->> 'email') = 'admin@pkoldboys.se');
